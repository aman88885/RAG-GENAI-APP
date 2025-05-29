require('dotenv').config();

// ============ Google Gemini ===================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const { GoogleGenAI } = require('@google/genai');

const genAI = new GoogleGenAI({
    apiKey: GEMINI_API_KEY
});

const DEV_EMBEDDING_MODEL = process.env.DEV_EMBEDDING_MODEL;

// ==============================================



const GenerateVectorEmbeddingOfTextUtil = async (chunks) => {
    try {
        let chunk_vector_embeddings = []; // Changed to an array to hold all embeddings

        for (const chunk of chunks) { // Iterating over the 'chunks' array
            const result = await genAI.models.embedContent({
                model: DEV_EMBEDDING_MODEL,
                contents: chunk,
            });

            chunk_vector_embeddings.push(result.embeddings[0].values); // Storing each embedding in an array
        }

        console.log(chunk_vector_embeddings); // Log all embeddings
        // console.log("Chunk vector embeddings created successfully");

    } catch (error) {
        console.log(`Error in ChunkCreationService: ${error}`);

        return {
            success: false,
            message: "Error in ChunkCreationService",
            error: error
        };
    }

};


module.exports = {
    GenerateVectorEmbeddingOfTextUtil
}