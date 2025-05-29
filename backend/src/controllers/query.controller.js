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
const { GoogleGenAI } = require('@google/genai');
const genAI = new GoogleGenAI({
    apiKey: GEMINI_API_KEY
});
const DEV_EMBEDDING_MODEL = process.env.DEV_EMBEDDING_MODEL;
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
        // console.log('Query:', query);
        // Validate input
        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Valid query is required'
            });
        }

        // Step 1: Convert the query into vector embedding
        const embeddingResponse = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/${DEV_EMBEDDING_MODEL}`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: query
                })
            }
        );
        // console.log('Embedding response status:', embeddingResponse);
        const embeddingResult = await embeddingResponse.json();
        // console.log('Embedding result:', embeddingResult);
        if (!embeddingResult.success) {
            throw new Error('Embedding generation failed: ' + JSON.stringify(embeddingResult.errors));
        }
        const query_vector_embedding = embeddingResult.result.data[0];
    

        // Step 2: Search Milvus vector database for relevant chunks
        const milvusResponseForQuery = await milvusClient.search({
            collection_name: 'RAG_TEXT_EMBEDDING_512D',
            vector: query_vector_embedding,
            limit: 5,
            metric_type: 'COSINE'
        });
        // console.log('Milvus response for query:', milvusResponseForQuery);

        const relevant_text_from_similarity_search = milvusResponseForQuery.results.map(
            (result) => result.text
        );

        if (!relevant_text_from_similarity_search.length) {
            return res.status(404).json({
                success: false,
                message: 'No relevant chunks found in the vector database'
            });
        }

        // Step 3: Generate answer using Workers AI
        const generativeResponse = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/${DEV_GENERATIVE_MODEL}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an intelligent assistant designed to answer queries strictly based on the provided context. Do not use external knowledge or make assumptions beyond the context. If the context lacks sufficient information, respond with: "Sorry, I cannot help you with that based on the given information."'
                        },
                        {
                            role: 'user',
                            content: `Context:\n${relevant_text_from_similarity_search.join('\n')}\n\nQuery:\n${query}`
                        }
                    ]
                })
            }
        );
        const generativeResult = await generativeResponse.json();
        if (!generativeResult.success) {
            throw new Error('Text generation failed: ' + JSON.stringify(generativeResult.errors));
        }
        const answer = generativeResult.result.response;

        // Step 4: Return the answer
        res.status(200).json({
            success: true,
            answer
        });
    } catch (error) {
        console.error('Error in QueryController:', error.message);
        if (error.message.includes('Embedding') || error.message.includes('Text generation')) {
            return res.status(500).json({
                success: false,
                message: 'Cloudflare Workers AI error'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = { QueryController };