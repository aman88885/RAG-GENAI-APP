require('dotenv').config();
const fs = require('fs');
const pdfParse = require('pdf-parse');

const vectorEmbedding = require('@xenova/transformers');

// ============ Google Gemini ===================
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const { GoogleGenAI } = require('@google/genai');
const genAI = new GoogleGenAI({
    apiKey: GEMINI_API_KEY
});
const DEV_EMBEDDING_MODEL = process.env.DEV_EMBEDDING_MODEL;
// ==============================================

// ============ OpenAI ============================
// const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// const OpenAi = require('openai');
// const openai = new OpenAi({
//     apikey: OPENAI_API_KEY
// })
// ==============================================

// const ConvertPDFToText = require('./../services/pdf_parse.service.js');



const IndexNewPDFController = async (req, res) => {
    try {

        console.log("Request received to index new PDF file");
        //TODO1: Get the file path and file name from the request
        const pdfFilePath = req.file.path; // uploads/pdfs/yourfile.pdf
        const pdfFileName = req.file.filename; // yourfile.pdf
        // ======================================================


        //TODO2: Convert entire pdf into text (pdf-parse)
        const pdfFile = fs.readFileSync(pdfFilePath);

        const pdfData = await pdfParse(pdfFile);

        const pdfText = pdfData.text; // Extracted text from PDF
        // ======================================================

        //TODO3: Convert the text into chunks
        const words = pdfText.split(/\s+/); // Split text into words
        const chunkSize = 1000; // Define the chunk size
        const chunks = [];
        for (let i = 0; i < words.length; i += chunkSize) {
            const chunk = words.slice(i, i + chunkSize).join(' ');
            chunks.push(chunk);
        } // let suppose words in pdf are 10000, then chunks will be 10 

        // ========================================================

        // TODO4: convert each  chunks to the  vector embedding (text-embedding-small-3)

        // chunks.forEach(async (chunk) => {
        //     const chunk_vector_embedding = await openai.embeddings.create({
        //         model: "text-embedding-3-small",
        //         input: chunk
        //     });
        //     console.log(chunk_vector_embedding);
        // });

        for (const chunk of chunks) {
            const result = await genAI.models.embedContent({
                model: DEV_EMBEDDING_MODEL,
                contents: chunk,
            });
            const vector = await result.embeddings[0].values; 
            console.log(vector);
        }
        // ====================================================



        // TODO5: Store the vector embedding in the vector  database (Milvus zilliz)
         

        // TODO6: Create a seacrch apis to search the vector database (Milvus zilliz) for most relevant results


        // ========== Delete the pdf file after indexing ==================
        try {
            fs.unlinkSync(pdfFilePath); // Just pass the file path
            console.log("PDF file deleted successfully");
        } catch (error) {
            console.error("Error while deleting the file", error);
        }
        // ================================================================

        res.status(201).json({
            success: true,
            message: "PDF is indexed in AI system",
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error while indexing PDF file " + error,
        })
    }
}

module.exports = {
    IndexNewPDFController
};