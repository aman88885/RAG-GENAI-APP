require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { v4: uuidv4 } = require('uuid');
const PDFSModel = require('../models/pdfs.model');
const USERSModel = require('../models/users.model');

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
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const DEV_EMBEDDING_MODEL = process.env.DEV_EMBEDDING_MODEL;
// ==============================================

// Validation function
const validateEnvironmentVariables = () => {
    const required = ['MILVUS_ENDPOINT_ADDRESS', 'MILVUS_TOKEN', 'GEMINI_API_KEY', 'DEV_EMBEDDING_MODEL'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
};

// Helper function to chunk text
const chunkText = (text, chunkSize = 1000, overlap = 100) => {
    const words = text.split(/\s+/);
    const chunks = [];
    
    for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
        const chunk = words.slice(i, i + chunkSize).join(' ');
        if (chunk.trim()) {
            chunks.push(chunk.trim());
        }
    }
    
    return chunks;
};

// =================== CONTROLLERS ===================

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

        // Create initial PDF record in database
        pdfRecord = new PDFSModel({
            name: pdfFileName,
            original_name: pdfFileName,
            uuid: pdfUuid,
            size: pdfFileSize,
            uploaded_by: req.user.userId, // From auth middleware
            indexing_status: 'processing'
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
        if (!pdfText || pdfText.trim().length < 50) {
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
        console.log(`📝 Created ${chunks.length} chunks from PDF`);

        // Process chunks and create embeddings
        let successfulChunks = 0;
        const embeddings = [];

        for (let index = 0; index < chunks.length; index++) {
            const chunk = chunks[index];

            try {
                // Generate vector embedding using Gemini
                const model = genAI.getGenerativeModel({ model: DEV_EMBEDDING_MODEL });
                const embeddingResult = await model.embedContent(chunk);
                const chunk_vector_embedding = embeddingResult.embedding.values;

                console.log(`✅ Generated vector embedding for chunk ${index + 1}/${chunks.length}`);

                // Prepare data for Milvus insertion
                const embeddingData = {
                    vector_embedding: chunk_vector_embedding,
                    pdf_text: chunk,
                    pdf_uuid: pdfUuid,
                    pdf_name: pdfFileName,
                    chunk_index: index,
                    user_id: req.user.userId.toString(),
                    created_at: new Date().toISOString()
                };

                embeddings.push(embeddingData);

            } catch (err) {
                console.error(`❌ Error generating embedding for chunk ${index + 1}:`, err.message);
                continue;
            }
        }

        // Batch insert into Milvus (more efficient)
        if (embeddings.length > 0) {
            try {
                const milvusResponse = await milvusClient.insert({
                    collection_name: "RAG_TEXT_EMBEDDING",
                    data: embeddings
                });

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

        res.status(201).json({
            success: true,
            message: "PDF indexed successfully",
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
                indexed_at: pdfRecord.indexed_at
            },
            endpoints: {
                query: `/api/v1/query/ask/${pdfUuid}`,
                info: `/api/v1/query/info/${pdfUuid}`
            }
        });

    } catch (error) {
        console.error("🔥 Internal error during PDF indexing:", error);

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

// Get user's PDFs (owned, shared, and public)
const GetUserPDFsController = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { page = 1, limit = 10, status, type = 'all' } = req.query;

        let pdfs;
        let total;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        // Build query options
        const options = {
            sort: { createdAt: -1 },
            limit: limitNum,
            skip: (pageNum - 1) * limitNum
        };

        // Get PDFs based on type
        switch (type) {
            case 'owned':
                const ownedQuery = { uploaded_by: userId };
                if (status) ownedQuery.indexing_status = status;
                
                pdfs = await PDFSModel.find(ownedQuery, null, options);
                total = await PDFSModel.countDocuments(ownedQuery);
                break;

            case 'shared':
                pdfs = await PDFSModel.findSharedWithUser(userId, options);
                total = await PDFSModel.countDocuments({ 'shared_with.user': userId });
                break;

            case 'public':
                pdfs = await PDFSModel.findPublic(options);
                total = await PDFSModel.countDocuments({ is_public: true });
                break;

            default: // 'all'
                pdfs = await PDFSModel.findByUser(userId, options);
                total = await PDFSModel.countDocuments({
                    $or: [
                        { uploaded_by: userId },
                        { is_public: true },
                        { 'shared_with.user': userId }
                    ]
                });
        }

        // Format response
        const formattedPdfs = pdfs.map(pdf => ({
            id: pdf._id,
            uuid: pdf.uuid,
            name: pdf.name,
            original_name: pdf.original_name,
            size: pdf.size,
            size_mb: pdf.size_mb,
            page_count: pdf.page_count,
            is_indexed: pdf.is_indexed,
            indexing_status: pdf.indexing_status,
            total_chunks: pdf.total_chunks,
            successful_chunks: pdf.successful_chunks,
            indexed_at: pdf.indexed_at,
            created_at: pdf.createdAt,
            updated_at: pdf.updatedAt,
            error_message: pdf.error_message,
            is_owner: pdf.uploaded_by.toString() === userId.toString(),
            is_public: pdf.is_public,
            permission: pdf.getUserPermission ? pdf.getUserPermission(userId) : 'read',
            tags: pdf.tags,
            description: pdf.description
        }));

        res.status(200).json({
            success: true,
            pdfs: formattedPdfs,
            pagination: {
                current_page: pageNum,
                total_pages: Math.ceil(total / limitNum),
                total_pdfs: total,
                has_next: pageNum * limitNum < total,
                has_prev: pageNum > 1,
                per_page: limitNum
            },
            filter: {
                type,
                status: status || 'all'
            }
        });

    } catch (error) {
        console.error('Error in GetUserPDFsController:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user PDFs',
            error: error.message
        });
    }
};

// Get single PDF details
const GetPDFDetailsController = async (req, res) => {
    try {
        const { uuid } = req.params;
        const userId = req.user.userId;

        // Find PDF
        const pdf = await PDFSModel.findOne({ uuid }).populate('uploaded_by', 'fullName email');
        
        if (!pdf) {
            return res.status(404).json({
                success: false,
                message: 'PDF not found'
            });
        }

        // Check access
        if (!pdf.hasAccess(userId)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view this PDF'
            });
        }

        res.status(200).json({
            success: true,
            pdf: {
                id: pdf._id,
                uuid: pdf.uuid,
                name: pdf.name,
                original_name: pdf.original_name,
                size: pdf.size,
                size_mb: pdf.size_mb,
                page_count: pdf.page_count,
                is_indexed: pdf.is_indexed,
                indexing_status: pdf.indexing_status,
                total_chunks: pdf.total_chunks,
                successful_chunks: pdf.successful_chunks,
                indexed_at: pdf.indexed_at,
                created_at: pdf.createdAt,
                updated_at: pdf.updatedAt,
                error_message: pdf.error_message,
                is_owner: pdf.uploaded_by._id.toString() === userId.toString(),
                is_public: pdf.is_public,
                permission: pdf.getUserPermission(userId),
                tags: pdf.tags,
                description: pdf.description,
                uploaded_by: {
                    name: pdf.uploaded_by.fullName,
                    email: pdf.uploaded_by.email
                },
                shared_with: pdf.shared_with.map(share => ({
                    permission: share.permission,
                    shared_at: share.shared_at
                }))
            }
        });

    } catch (error) {
        console.error('Error in GetPDFDetailsController:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching PDF details',
            error: error.message
        });
    }
};

// Update PDF metadata
const UpdatePDFController = async (req, res) => {
    try {
        const { uuid } = req.params;
        const userId = req.user.userId;
        const { name, description, tags, is_public } = req.body;

        // Find PDF
        const pdf = await PDFSModel.findOne({ uuid, uploaded_by: userId });
        
        if (!pdf) {
            return res.status(404).json({
                success: false,
                message: 'PDF not found or you do not have permission to update it'
            });
        }

        // Update fields
        if (name) pdf.name = name;
        if (description !== undefined) pdf.description = description;
        if (tags) pdf.tags = tags;
        if (is_public !== undefined) pdf.is_public = is_public;

        await pdf.save();

        res.status(200).json({
            success: true,
            message: 'PDF updated successfully',
            pdf: {
                id: pdf._id,
                uuid: pdf.uuid,
                name: pdf.name,
                description: pdf.description,
                tags: pdf.tags,
                is_public: pdf.is_public,
                updated_at: pdf.updatedAt
            }
        });

    } catch (error) {
        console.error('Error in UpdatePDFController:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating PDF',
            error: error.message
        });
    }
};

// Share PDF with user
const SharePDFController = async (req, res) => {
    try {
        const { uuid } = req.params;
        const userId = req.user.userId;
        const { user_email, permission = 'read' } = req.body;

        // Validate permission
        if (!['read', 'write'].includes(permission)) {
            return res.status(400).json({
                success: false,
                message: 'Permission must be either "read" or "write"'
            });
        }

        // Find PDF
        const pdf = await PDFSModel.findOne({ uuid, uploaded_by: userId });
        if (!pdf) {
            return res.status(404).json({
                success: false,
                message: 'PDF not found or you do not have permission to share it'
            });
        }

        // Find user to share with
        const userToShareWith = await USERSModel.findOne({ email: user_email });
        if (!userToShareWith) {
            return res.status(404).json({
                success: false,
                message: 'User not found with this email address'
            });
        }

        // Share PDF
        await pdf.shareWith(userToShareWith._id, permission);

        res.status(200).json({
            success: true,
            message: `PDF shared successfully with ${user_email}`,
            shared_with: {
                user: {
                    name: userToShareWith.fullName,
                    email: userToShareWith.email
                },
                permission: permission
            }
        });

    } catch (error) {
        console.error('Error in SharePDFController:', error);
        
        if (error.message.includes('Cannot share PDF with owner')) {
            return res.status(400).json({
                success: false,
                message: 'Cannot share PDF with yourself'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error sharing PDF',
            error: error.message
        });
    }
};

// Remove PDF sharing
const RemoveSharingController = async (req, res) => {
    try {
        const { uuid } = req.params;
        const userId = req.user.userId;
        const { user_email } = req.body;

        // Find PDF
        const pdf = await PDFSModel.findOne({ uuid, uploaded_by: userId });
        if (!pdf) {
            return res.status(404).json({
                success: false,
                message: 'PDF not found or you do not have permission to modify sharing'
            });
        }

        // Find user to remove sharing from
        const userToRemove = await USERSModel.findOne({ email: user_email });
        if (!userToRemove) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Remove sharing
        await pdf.removeSharing(userToRemove._id);

        res.status(200).json({
            success: true,
            message: `Sharing removed for ${user_email}`
        });

    } catch (error) {
        console.error('Error in RemoveSharingController:', error);
        res.status(500).json({
            success: false,
            message: 'Error removing sharing',
            error: error.message
        });
    }
};

// Delete PDF and its vectors
const DeletePDFController = async (req, res) => {
    try {
        const { uuid } = req.params;
        const userId = req.user.userId;

        // Find PDF record
        const pdfRecord = await PDFSModel.findOne({ uuid, uploaded_by: userId });
        if (!pdfRecord) {
            return res.status(404).json({
                success: false,
                message: 'PDF not found or you do not have permission to delete it'
            });
        }

        // Delete vectors from Milvus
        try {
            await milvusClient.delete({
                collection_name: "RAG_TEXT_EMBEDDING",
                filter: `pdf_uuid == "${uuid}"`
            });
            console.log(`🗑️ Deleted vectors for PDF UUID: ${uuid}`);
        } catch (milvusError) {
            console.error('Error deleting from Milvus:', milvusError);
            // Continue with database deletion even if Milvus deletion fails
        }

        // Delete PDF record from database
        await PDFSModel.findByIdAndDelete(pdfRecord._id);

        res.status(200).json({
            success: true,
            message: 'PDF and associated data deleted successfully',
            deleted_pdf: {
                id: pdfRecord._id,
                uuid: pdfRecord.uuid,
                name: pdfRecord.name
            }
        });

    } catch (error) {
        console.error('Error in DeletePDFController:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting PDF',
            error: error.message
        });
    }
};

// Get PDFs by status (for admin/monitoring)
const GetPDFsByStatusController = async (req, res) => {
    try {
        const { status } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const validStatuses = ['pending', 'processing', 'completed', 'failed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
            });
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const pdfs = await PDFSModel.findByIndexingStatus(status, {
            sort: { createdAt: -1 },
            limit: limitNum,
            skip: (pageNum - 1) * limitNum
        }).populate('uploaded_by', 'fullName email');

        const total = await PDFSModel.countDocuments({ indexing_status: status });

        res.status(200).json({
            success: true,
            status: status,
            pdfs: pdfs.map(pdf => ({
                id: pdf._id,
                uuid: pdf.uuid,
                name: pdf.name,
                size_mb: pdf.size_mb,
                indexing_status: pdf.indexing_status,
                total_chunks: pdf.total_chunks,
                successful_chunks: pdf.successful_chunks,
                error_message: pdf.error_message,
                created_at: pdf.createdAt,
                uploaded_by: {
                    name: pdf.uploaded_by.fullName,
                    email: pdf.uploaded_by.email
                }
            })),
            pagination: {
                current_page: pageNum,
                total_pages: Math.ceil(total / limitNum),
                total_pdfs: total,
                has_next: pageNum * limitNum < total,
                has_prev: pageNum > 1
            }
        });

    } catch (error) {
        console.error('Error in GetPDFsByStatusController:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching PDFs by status',
            error: error.message
        });
    }
};

module.exports = {
    IndexNewPDFController,
    GetUserPDFsController,
    GetPDFDetailsController,
    UpdatePDFController,
    SharePDFController,
    RemoveSharingController,
    DeletePDFController,
    GetPDFsByStatusController
};