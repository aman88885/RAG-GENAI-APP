require('dotenv').config();
const fs = require('fs');
const pdfParse = require('pdf-parse');

// =================== Milvus Zilliz ================== 
const { MilvusClient } = require("@zilliz/milvus2-sdk-node");

const MILVUS_ENDPOINT_ADDRESS = process.env.MILVUS_ENDPOINT_ADDRESS;
const MILVUS_TOKEN = process.env.MILVUS_TOKEN;

const milvusClient = new MilvusClient({
    address: MILVUS_ENDPOINT_ADDRESS,
    token: MILVUS_TOKEN,
    timeout: 60000
});
// ===================================================

// ============ Google Gemini ===================
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const { GoogleGenAI } = require('@google/genai');
const genAI = new GoogleGenAI({
    apiKey: GEMINI_API_KEY
});
const DEV_EMBEDDING_MODEL = process.env.DEV_EMBEDDING_MODEL;
// ==============================================

const IndexNewPDFController = async (req, res) => {
    try {
        console.log("Request received to index new PDF file");

        //TODO1: Get the file path and file name from the request
        const pdfFilePath = req.file.path; // uploads/pdfs/yourfile.pdf
        const pdfFileName = req.file.filename; // yourfile.pdf
        // ======================================================

        //TODO2: Convert entire pdf into text (pdf-parse)
        const pdfFile = fs.readFileSync(pdfFilePath);

        let pdfText = "";
        try {
            const pdfData = await pdfParse(pdfFile);
            pdfText = pdfData.text; // Extracted text from PDF
            console.log(pdfText);
        } catch (error) {
            console.error("⚠️ PDF parsing failed:", error);
            return res.status(400).json({
                success: false,
                message: "Failed to parse the PDF. Please try uploading a valid or re-exported PDF.",
            });
        }
        // ======================================================

        //TODO3: Convert the text into chunks
        const words = pdfText.split(/\s+/); // Split text into words like "Hello world! This is a aman." -> ["Hello", "world!", "This", "is", "a", "aman."]
        const chunkSize = 1000; // Define the chunk size
        const chunks = [];
        for (let i = 0; i < words.length; i += chunkSize) {
            const chunk = words.slice(i, i + chunkSize).join(' ');
            chunks.push(chunk);
        }
        // console.log(chunks)
        // ========================================================

        // TODO4 & TODO5: Convert chunks to embeddings & store in Milvus DB
        for (let index = 0; index < chunks.length; index++) {
            const chunk = chunks[index];

            try {
                // Generate vector embedding for the chunk using Google Gemini
                const chunk_vector_embedding_response = await genAI.models.embedContent({
                    model: DEV_EMBEDDING_MODEL,
                    contents: chunk
                });
                console.log(chunk_vector_embedding_response);
                
                // Check if the response contains embeddings
                const chunk_vector_embedding = chunk_vector_embedding_response.embeddings[0].values;
                console.log(chunk_vector_embedding);
                console.log(`✅ Generated vector embedding for chunk ${index + 1}`);

                // Insert the chunk and its vector embedding into Milvus Vector DB
                const milvusResponseForInsert = await milvusClient.insert({
                    collection_name: "RAG_TEXT_EMBEDDING",
                    data: [
                        {
                            vector_embedding: chunk_vector_embedding,
                            pdf_text: chunk,
                            // pdf_Name: pdfFileName
                        }
                    ]
                });

                if (milvusResponseForInsert.insert_cnt == 1) {
                    console.log(`✅ Chunk no. ${index + 1} is stored in Milvus Vector DB successfully`);
                } else {
                    console.log(`❌ Chunk no. ${index + 1} failed to store in Milvus Vector DB`);
                }

            } catch (err) {
                console.error(`❌ Error embedding/storing chunk ${index + 1}:`, err);
            }
        }

        // ========== Delete the pdf file after indexing ==================
        try {
            fs.unlinkSync(pdfFilePath); // Just pass the file path
            console.log("🧹 PDF file deleted successfully");
        } catch (error) {
            console.error("⚠️ Error while deleting the file", error);
        }
        // ================================================================

        console.log(`📄 PDF with name ${pdfFileName} is indexed successfully!`);
        res.status(201).json({
            success: true,
            message: "PDF is indexed in AI system",
        });

    } catch (error) {
        console.error("🔥 Internal error during PDF indexing:", error);
        res.status(500).json({
            success: false,
            message: "Error while indexing PDF file: " + error.message,
        });
    }
};

module.exports = {
    IndexNewPDFController
};
