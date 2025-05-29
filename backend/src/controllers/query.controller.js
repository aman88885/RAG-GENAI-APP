require('dotenv').config();
const { MilvusClient } = require('@zilliz/milvus2-sdk-node');
const fetch = require('node-fetch');

// Environment variables
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const DEV_GENERATIVE_MODEL = process.env.DEV_GENERATIVE_MODEL || '@cf/meta/llama-3.1-8b-instruct';
const MILVUS_ENDPOINT_ADDRESS = process.env.MILVUS_ENDPOINT_ADDRESS;
const MILVUS_TOKEN = process.env.MILVUS_TOKEN;

// ============ Google Gemini ===================
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const DEV_EMBEDDING_MODEL = process.env.DEV_EMBEDDING_MODEL || 'text-embedding-004';
// ==============================================

// Validate environment variables
if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    console.error('Cloudflare credentials are missing in .env');
    process.exit(1);
}
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
        // console.log(milvusResponseForQuery)
        // console.log('Milvus search response:', milvusResponseForQuery); 
        // console.log('Milvus search completed, found:', milvusResponseForQuery.results?.length || 0, 'results');

        if (!milvusResponseForQuery.results || milvusResponseForQuery.results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No relevant chunks found in the vector database'
            });
        }

        const relevant_text_from_similarity_search = milvusResponseForQuery.results.map((elem) => elem.pdf_text);
        // console.log("simialrity search result " ,relevant_text_from_similarity_search)


        // console.log('Retrieved', relevant_text_from_similarity_search);

        // Step 3: Generate answer using Cloudflare Workers AI
        // console.log('Testing Cloudflare credentials...');
        // console.log('Account ID:', CLOUDFLARE_ACCOUNT_ID);
        // console.log('Token exists:', CLOUDFLARE_API_TOKEN?.substring(0,8) + "...");


        // const generativeResponse = await fetch(
        //     `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/${DEV_GENERATIVE_MODEL}`,
        //     {
        //         method: 'POST', // Changed from GET to POST
        //         headers: {
        //             'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        //             'Content-Type': 'application/json'
        //         },
        //         body: JSON.stringify({
        //             messages: [
        //                 {
        //                     role: 'system',
        //                     content: 'You are an intelligent assistant designed to answer queries strictly based on the provided context. Do not use external knowledge or make assumptions beyond the context. If the context lacks sufficient information, respond with: "Sorry, I cannot help you with that based on the given information."'
        //                 },
        //                 {
        //                     role: 'user',
        //                     content: `Context:\n${relevant_text_from_similarity_search.join('\n\n')}\n\nQuery: ${query}`
        //                 }
        //             ]
        //         })
        //     }
        // );

        // if (!generativeResponse.ok) {
        //     throw new Error(`Cloudflare API error: ${generativeResponse.status} ${generativeResponse.statusText}`);
        // }

        // const generativeResult = await generativeResponse.json();
        // console.log('Cloudflare response:', generativeResult);

        // if (!generativeResult.success) {
        //     throw new Error('Text generation failed: ' + JSON.stringify(generativeResult.errors || generativeResult));
        // }

        // const answer = generativeResult.result?.response || generativeResult.result?.content || 'No response generated';
        // Use Gemini for both embedding AND generation
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(`Context: ${relevant_text_from_similarity_search.join('\n\n')}
        Query: ${query}
        Instructions: Answer based only on the provided context.`);
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