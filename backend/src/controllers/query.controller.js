require('dotenv').config();
const { MilvusClient } = require('@zilliz/milvus2-sdk-node');


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
        const { query } = req.body;

        // Validate input
        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Valid query is required'
            });
        }
        console.log('Received query:', query);

        // Step 1: Convert the query into vector embedding using Gemini
        const modell = genAI.getGenerativeModel({ model: DEV_EMBEDDING_MODEL });
        const embeddingResult = await modell.embedContent(query);

        const query_vector_embedding = embeddingResult.embedding.values;
        // console.log(query_vector_embedding);

        // Step 2: Search Milvus vector database for relevant chunks
        const milvusResponseForQuery = await milvusClient.search({
            collection_name: 'RAG_TEXT_EMBEDDING',
            data: query_vector_embedding,
            limit: 5,

        });

        if (!milvusResponseForQuery.results || milvusResponseForQuery.results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No relevant chunks found in the vector database'
            });
        }

        const relevant_text_from_similarity_search = milvusResponseForQuery.results.map((elem) => elem.pdf_text);
        
        // Use Gemini for both embedding AND generation
        // Step 3: Generate an answer based on the context and query
        const model = genAI.getGenerativeModel({ model: DEV_GENERATIVE_MODEL });

        const result = await model.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: `You are an intelligent assistant designed to answer queries strictly based on the provided context. Do not use external knowledge or make assumptions beyond the context. If the context lacks sufficient information, respond with: "Sorry, I cannot help you with that based on the given information."
                            Context: ${relevant_text_from_similarity_search.join('\n\n')}
                            Query: ${query}`
                        }
                    ]
                }
            ]
        });

        const answer = result.response.text();
        // console.log('Generated answer:', answer);

        // Step 4: Return the answer
        res.status(200).json({
            success: true,
            answer,
            context_chunks_used: relevant_text_from_similarity_search.length,
            similarity_scores: milvusResponseForQuery.results.map(r => r.score)
        });

    } catch (error) {
        console.error('Error in QueryController:', error.message);
        console.error('Full error:', error);

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

        res.status(500).json({
            success: false,
            message: 'Internal server error: ' + error.message
        });
    }
};

module.exports = { QueryController };