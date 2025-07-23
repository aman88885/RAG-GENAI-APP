require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { v4: uuidv4 } = require('uuid');
const PDFSModel = require('../models/pdfs.model');
const { chunkText } = require('../utils/chunkText.utils');
const { validateEnvironmentVariables } = require('../utils/validateEnvironmentVariables.utils');
const { uploadPDFToCloudinary, deletePDFFromCloudinary } = require('../config/cloudinary.config');

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
const DEV_EMBEDDING_MODEL = process.env.DEV_EMBEDDING_MODEL;
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// ==============================================

// =================== CONTROLLER ===================
// Index new PDF
const IndexNewPDFController = async (req, res) => {
    let pdfRecord = null;
    let pdfFilePath = null;

    try {
        console.log("📄 Request received to index new PDF file");

        // Validate environment variables
        validateEnvironmentVariables();

        // Validate file upload
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No PDF file uploaded"
            });
        }

        pdfFilePath = req.file.path;
        const pdfFileName = req.file.originalname;
        const pdfFileSize = req.file.size;

        // Generate unique UUID for this PDF
        const pdfUuid = uuidv4();
        console.log(`📋 Generated UUID for PDF: ${pdfUuid}`);

        console.log("☁️ Uploading PDF to Cloudinary...");
        cloudinaryUploadResult = await uploadPDFToCloudinary(pdfFilePath, pdfFileName, req.userId);

        if (!cloudinaryUploadResult.success) {
            console.error("❌ Cloudinary upload failed:", cloudinaryUploadResult.error);
            return res.status(500).json({
                success: false,
                message: "Failed to upload PDF to cloud storage",
                error: cloudinaryUploadResult.error
            });
        }

        console.log(`✅ PDF uploaded to Cloudinary: ${cloudinaryUploadResult.url}`);


        // Create initial PDF record in database
        pdfRecord = new PDFSModel({
            name: pdfFileName,
            original_name: pdfFileName,
            uuid: pdfUuid,
            size: pdfFileSize,
            uploaded_by: req.userId, // From auth middleware
            indexing_status: 'processing',
            cloudinary_url: cloudinaryUploadResult.url,
            cloudinary_public_id: cloudinaryUploadResult.public_id,
            cloudinary_bytes: cloudinaryUploadResult.bytes,
            cloudinary_format: cloudinaryUploadResult.format,
            storage_type: 'cloudinary'
        });

        await pdfRecord.save();
        console.log(`💾 PDF record created in database with ID: ${pdfRecord._id}`);

        // Parse PDF and extract text
        const pdfFile = fs.readFileSync(pdfFilePath);
        let pdfText = "";
        let pageCount = 0;

        try {
            const pdfData = await pdfParse(pdfFile);
            pdfText = pdfData.text;
            pageCount = pdfData.numpages;
            console.log(`✅ PDF text extracted successfully (${pageCount} pages)`);
        } catch (error) {
            console.error("⚠️ PDF parsing failed:", error);

            // Update PDF record with error
            pdfRecord.indexing_status = 'failed';
            pdfRecord.error_message = 'Failed to parse PDF content';
            await pdfRecord.save();

            // Clean up - delete from Cloudinary if parsing failed
            await deletePDFFromCloudinary(cloudinaryUploadResult.public_id);

            return res.status(400).json({
                success: false,
                message: "Failed to parse the PDF. Please try uploading a valid PDF file.",
                pdf_id: pdfRecord._id
            });
        }

        // Update PDF record with page count
        pdfRecord.page_count = pageCount;
        await pdfRecord.save();

        // Validate extracted text
        if (!pdfText || pdfText.trim().length < 2000) {
            pdfRecord.indexing_status = 'failed';
            pdfRecord.error_message = 'PDF contains insufficient text content';
            await pdfRecord.save();

            return res.status(400).json({
                success: false,
                message: "PDF contains insufficient text content for indexing.",
                pdf_id: pdfRecord._id
            });
        }

        // Convert text into chunks with overlap
        const chunks = chunkText(pdfText, 1000, 100);
        // console.log(`📝 Created ${chunks.length} chunks from PDF`);
        // console.log(`🧠 Chunk length: ${chunks}`);


        // Process chunks and create embeddings
        let successfulChunks = 0;
        const embeddings = [];

        for (let index = 0; index < chunks.length; index++) {
            const chunk = chunks[index];

            const cleanChunk = chunk
                .replace(/[“”‘’]/g, '"')          // smart quotes
                .replace(/[•➜→]/g, '-')          // bullet-like symbols
                .replace(/[^ -~\n]/g, '')         // remove non-printable characters
                .trim();
            // console.log(cleanChunk);

            try {
                // Generate vector embedding using Gemini
                const model = genAI.getGenerativeModel({ model: DEV_EMBEDDING_MODEL });
                const embeddingResult = await model.embedContent(cleanChunk);
                // console.log(embeddingResult)

                if (!embeddingResult || !embeddingResult.embedding || !embeddingResult.embedding.values?.length) {
                    throw new Error('⚠️ Empty or invalid embedding from Gemini for chunk ' + index);
                }

                const chunk_vector_embedding = embeddingResult.embedding.values;
                // console.log(chunk_vector_embedding)

                // console.log(`✅ Generated vector embedding for chunk ${index + 1}/${chunks.length}`);

                // Prepare data for Milvus insertion
                const embeddingData = {
                    vector_embedding: chunk_vector_embedding,
                    pdf_text: chunk,
                    pdf_uuid: pdfUuid,
                    pdf_name: pdfFileName,
                    chunk_index: index,
                    user_id: req.userId.toString(),
                    created_at: new Date().toISOString(),
                    cloudinary_url: cloudinaryUploadResult.url
                };
                // console.log(embeddingData)

                embeddings.push(embeddingData);

            } catch (err) {
                console.error(`❌ Error generating embedding for chunk ${index + 1}:`, err.message);
                continue;
            }
        }

        // Batch insert into Milvus (more efficient)
        if (embeddings.length > 0) {
            try {
                // Best solution - combine timeout + connection check
                if (!milvusClient.connected) {
                    milvusClient.connect();
                }

                const milvusResponse = await Promise.race([
                    milvusClient.insert({
                        collection_name: "RAG_TEXT_EMBEDDING",
                        data: embeddings
                    }),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Milvus insert timeout after 30s')), 300000)
                    )
                ]);

                successfulChunks = milvusResponse.insert_cnt || 0;
                console.log(`✅ Successfully inserted ${successfulChunks} chunks into Milvus`);

            } catch (milvusError) {
                console.error('❌ Milvus batch insert failed:', milvusError);

                // Try individual inserts as fallback
                for (const embedding of embeddings) {
                    try {
                        await milvusClient.insert({
                            collection_name: "RAG_TEXT_EMBEDDING",
                            data: [embedding]
                        });
                        successfulChunks++;
                    } catch (err) {
                        console.error(`❌ Individual insert failed for chunk:`, err.message);
                    }
                }
            }
        }



        // Update PDF record with final status
        pdfRecord.total_chunks = chunks.length;
        pdfRecord.successful_chunks = successfulChunks;
        pdfRecord.is_indexed = successfulChunks > 0;
        pdfRecord.indexing_status = successfulChunks > 0 ? 'completed' : 'failed';

        if (successfulChunks === 0) {
            pdfRecord.error_message = 'Failed to index any chunks';

            // If indexing completely failed, delete from Cloudinary
            await deletePDFFromCloudinary(cloudinaryUploadResult.public_id);
        }

        await pdfRecord.save();

        // Clean up uploaded file
        try {
            fs.unlinkSync(pdfFilePath);
            console.log("🧹 PDF file deleted successfully");
        } catch (error) {
            console.error("⚠️ Error deleting uploaded file:", error.message);
        }

        console.log(`📄 PDF indexing completed for ${pdfFileName}`);
        console.log(`📊 Total chunks: ${chunks.length}, Successful: ${successfulChunks}`);

        const indexingMessage =
            successfulChunks === chunks.length
                ? "✅ All PDF chunks were successfully indexed."
                : successfulChunks === 0
                    ? "❌ PDF indexing failed. No chunks were saved."
                    : `⚠️ Partially indexed: ${successfulChunks} out of ${chunks.length} chunks were successfully indexed.`;


        res.status(201).json({
            success: successfulChunks > 0,
            message: indexingMessage,
            pdf: {
                id: pdfRecord._id,
                uuid: pdfUuid,
                name: pdfFileName,
                size: pdfFileSize,
                size_mb: (pdfFileSize / (1024 * 1024)).toFixed(2),
                page_count: pageCount,
                total_chunks: chunks.length,
                successful_chunks: successfulChunks,
                indexing_status: pdfRecord.indexing_status,
                indexed_at: pdfRecord.indexed_at,
                cloudinary_url: cloudinaryUploadResult.url,
                storage_type: 'cloudinary'
            },
            endpoints: {
                query: `/api/v1/pdf/ask/${pdfUuid}`,
                info: `/api/v1/pdf/info/${pdfUuid}`,
                download: cloudinaryUploadResult.url
            }
        });

        console.log(`📄 PDF indexed successfully: ${pdfFileName} (${pdfUuid})`);
    } catch (error) {
        console.error("🔥 Internal error during PDF indexing:", error);

        // Clean up Cloudinary upload if something went wrong
        if (cloudinaryUploadResult && cloudinaryUploadResult.success) {
            try {
                await deletePDFFromCloudinary(cloudinaryUploadResult.public_id);
                console.log("🧹 Cleaned up Cloudinary upload due to error");
            } catch (cleanupError) {
                console.error("⚠️ Error cleaning up Cloudinary upload:", cleanupError);
            }
        }

        // Update PDF record with error if it exists
        if (pdfRecord) {
            try {
                pdfRecord.indexing_status = 'failed';
                pdfRecord.error_message = error.message;
                await pdfRecord.save();
            } catch (dbError) {
                console.error("❌ Failed to update PDF record with error:", dbError);
            }
        }

        // Clean up uploaded file if it exists
        if (pdfFilePath && fs.existsSync(pdfFilePath)) {
            try {
                fs.unlinkSync(pdfFilePath);
            } catch (cleanupError) {
                console.error("⚠️ Error cleaning up file:", cleanupError);
            }
        }

        res.status(500).json({
            success: false,
            message: "Error while indexing PDF file",
            error: error.message,
            pdf_id: pdfRecord?._id
        });
    }
};

module.exports = {
    IndexNewPDFController
}