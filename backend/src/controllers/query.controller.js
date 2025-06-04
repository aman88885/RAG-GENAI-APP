// controllers/query.controller.js
require('dotenv').config();
const { MilvusClient } = require('@zilliz/milvus2-sdk-node');
const  PDFSModel  = require('../models/pdfs.model');

// Environment variables
const DEV_GENERATIVE_MODEL = process.env.DEV_GENERATIVE_MODEL;
const MILVUS_ENDPOINT_ADDRESS = process.env.MILVUS_ENDPOINT_ADDRESS;
const MILVUS_TOKEN = process.env.MILVUS_TOKEN;

// ============ Google Gemini ===================
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const DEV_EMBEDDING_MODEL = process.env.DEV_EMBEDDING_MODEL;
// ==============================================

if (!MILVUS_ENDPOINT_ADDRESS || !MILVUS_TOKEN) {
    console.error('Milvus credentials are missing in .env');
    process.exit(1);
}
if (!GEMINI_API_KEY) {
    console.error('Gemini API key is missing in .env');
    process.exit(1);
}

// Initialize Milvus client
const milvusClient = new MilvusClient({
    address: MILVUS_ENDPOINT_ADDRESS,
    token: MILVUS_TOKEN,
    timeout: 60000
});

const QueryController = async (req, res) => {
    try {
        console.log('Request received to query the vector database');

        // Extract UUID from URL parameters
        const { uuid } = req.params;
        const { query } = req.body;

        // Validate input
        if (!uuid || typeof uuid !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Valid PDF UUID is required in the URL'
            });
        }

        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Valid query is required in request body'
            });
        }

        console.log('PDF UUID:', uuid);
        console.log('Received query:', query);

        const pdfRecord = await PDFSModel.findOne({ uuid }).select('name page_count total_chunks successful_chunks createdAt');
        if (!pdfRecord) {
            return res.status(404).json({ success: false, message: 'PDF with this UUID not found in database' });
        }

        // Step 1: Convert the query into vector embedding using Gemini
        const embeddingModel = genAI.getGenerativeModel(
            {
                model: DEV_EMBEDDING_MODEL
            }
        );
        const embeddingResult = await embeddingModel.embedContent(query);
        const query_vector_embedding = embeddingResult.embedding.values;
        console.log('✅ Query vector embedding generated');

        // Step 2: Search Milvus vector database for relevant chunks (filtered by UUID)
        const milvusResponseForQuery = await milvusClient.search({
            collection_name: 'RAG_TEXT_EMBEDDING',
            data: [query_vector_embedding],
            limit: 5,
            // Filter by PDF UUID to only search within specific PDF
            filter: `pdf_uuid == "${uuid}"`
        });

        if (!milvusResponseForQuery.results || milvusResponseForQuery.results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No relevant chunks found for this PDF. Please check if the UUID is correct or if the PDF was properly indexed.'
            });
        }

        console.log(`✅ Found ${milvusResponseForQuery.results.length} relevant chunks`);

        // Extract relevant text and metadata
        const relevant_chunks = milvusResponseForQuery.results.map((elem) => ({
            text: elem.pdf_text,
            score: elem.score,
            chunk_index: elem.chunk_index || 0,
            pdf_name: elem.pdf_name || 'Unknown'
        }));

        const relevant_text_from_similarity_search = relevant_chunks.map(chunk => chunk.text);

        // Step 3: Generate an answer based on the context and query
        const generativeModel = genAI.getGenerativeModel({ model: DEV_GENERATIVE_MODEL });

        const result = await generativeModel.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: `You are an intelligent assistant designed to answer queries strictly based on the provided context from a specific PDF document. Do not use external knowledge or make assumptions beyond the context. If the context lacks sufficient information, respond with: "Sorry, I cannot find the answer to your question "${query}" in this document." Context from PDF: ${relevant_text_from_similarity_search.join('\n\n')} User Query: ${query} Please provide a comprehensive answer based only on the information available in the context above.`
                        }
                    ]
                }
            ]
        });

        const answer = result.response.text();
        console.log('✅ Generated answer for PDF UUID:', uuid);

        // Step 4: Return the answer with metadata
        res.status(200).json({
            success: true,
            pdf_uuid: uuid,
            pdf_name: relevant_chunks[0]?.pdf_name || 'Unknown',
            query: query,
            answer,
            context_chunks_used: relevant_text_from_similarity_search.length,
            similarity_scores: milvusResponseForQuery.results.map(r => r.score),
            chunks_metadata: relevant_chunks.map(chunk => ({
                chunk_index: chunk.chunk_index,
                similarity_score: chunk.score
            }))
        });

    } catch (error) {
        console.error('Error in QueryController:', error.message);
        console.error('Full error:', error);

        // Handle specific error types
        if (error.message.includes('Embedding') || error.message.includes('Text generation')) {
            return res.status(500).json({
                success: false,
                message: 'AI service error: ' + error.message
            });
        }

        if (error.message.includes('Milvus') || error.message.includes('collection')) {
            return res.status(500).json({
                success: false,
                message: 'Vector database error: ' + error.message
            });
        }

        if (error.message.includes('filter')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid UUID format or PDF not found: ' + error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error: ' + error.message
        });
    }
};

// Optional: Controller to get PDF metadata by UUID
const GetPDFInfoController = async (req, res) => {
    try {
        const { uuid } = req.params;

        if (!uuid || typeof uuid !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Valid PDF UUID is required'
            });
        }

        console.log('Getting PDF info for UUID:', uuid);

        // Query to get PDF metadata
        const milvusResponse = await milvusClient.query({
            collection_name: 'RAG_TEXT_EMBEDDING',
            filter: `pdf_uuid == "${uuid}"`,
            output_fields: ['pdf_name', 'pdf_uuid', 'created_at', 'chunk_index'],
            limit: 1
        });

        if (!milvusResponse.data || milvusResponse.data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'PDF not found with the provided UUID'
            });
        }

        // Count total chunks for this PDF
        const countResponse = await milvusClient.query({
            collection_name: 'RAG_TEXT_EMBEDDING',
            filter: `pdf_uuid == "${uuid}"`,
            output_fields: ['chunk_index']
        });

        const pdfInfo = milvusResponse.data[0];
        res.status(200).json({
            success: true,
            pdf_uuid: uuid,
            pdf_name: pdfInfo.pdf_name,
            created_at: pdfInfo.created_at,
            total_chunks: countResponse.data.length,
            chat_endpoint: `http://localhost:4000/api/v1/pdf/query/ask/${uuid}`
        });

    } catch (error) {
        console.error('Error in GetPDFInfoController:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving PDF information: ' + error.message
        });
    }
};
const ListPDFsController = async (req, res) => {
    try {
        const userId = req.userId;  // ← Change this line
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }
        
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;

        const pdfs = await PDFSModel.findByUser(userId, {
            sort: { createdAt: -1 },
            limit,
            skip: (page - 1) * limit
        });

        res.status(200).json({
            success: true,
            total: pdfs.length,
            pdfs
        });

    } catch (error) {
        console.error('Error in ListPDFsController:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to list PDFs: ' + error.message
        });
    }
};

module.exports = {
    QueryController,
    GetPDFInfoController,
    ListPDFsController
};