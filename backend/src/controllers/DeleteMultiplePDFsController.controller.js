require('dotenv').config();
const PDFSModel = require('../models/pdfs.model');

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



// Validation function
const validateEnvironmentVariables = () => {
    const required = ['MILVUS_ENDPOINT_ADDRESS', 'MILVUS_TOKEN', 'GEMINI_API_KEY', 'DEV_EMBEDDING_MODEL'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
};

// Delete PDF Controller



// Delete multiple PDFs controller (bulk delete)
const DeleteMultiplePDFsController = async (req, res) => {
    try {
        console.log("🗑️ Request received to delete multiple PDFs");

        validateEnvironmentVariables();

        const { pdfIds } = req.body; // Array of PDF IDs (can be _id or uuid)
        const userId = req.userId;

        if (!pdfIds || !Array.isArray(pdfIds) || pdfIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Array of PDF IDs is required"
            });
        }

        if (pdfIds.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete more than 100 PDFs at once"
            });
        }

        // Find all PDF records
        const pdfRecords = [];
        
        for (const pdfId of pdfIds) {
            let pdfRecord;
            
            if (pdfId.match(/^[0-9a-fA-F]{24}$/)) {
                pdfRecord = await PDFSModel.findById(pdfId);
            } else {
                pdfRecord = await PDFSModel.findOne({ uuid: pdfId });
            }

            if (pdfRecord && pdfRecord.uploaded_by.toString() === userId.toString()) {
                pdfRecords.push(pdfRecord);
            }
        }

        if (pdfRecords.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No valid PDFs found for deletion"
            });
        }

        console.log(`📋 Found ${pdfRecords.length} PDF records for deletion`);

        // Delete vectors from Milvus
        let totalDeletedVectors = 0;
        const uuids = pdfRecords.map(pdf => pdf.uuid);
        
        try {
            // Create filter for multiple UUIDs
            const uuidFilter = uuids.map(uuid => `"${uuid}"`).join(', ');
            const milvusDeleteResponse = await milvusClient.delete({
                collection_name: "RAG_TEXT_EMBEDDING",
                filter: `pdf_uuid in [${uuidFilter}]`
            });

            totalDeletedVectors = milvusDeleteResponse.delete_cnt || 0;
            console.log(`✅ Deleted ${totalDeletedVectors} vectors from Milvus`);

        } catch (milvusError) {
            console.error("❌ Error deleting vectors from Milvus:", milvusError);
            console.warn("⚠️ Continuing with database deletion despite Milvus error");
        }

        // Delete PDF records from MongoDB
        const pdfRecordIds = pdfRecords.map(pdf => pdf._id);
        const deleteResult = await PDFSModel.deleteMany({
            _id: { $in: pdfRecordIds }
        });

        console.log(`✅ Deleted ${deleteResult.deletedCount} PDF records from database`);

        const deletedPDFs = pdfRecords.map(pdf => ({
            id: pdf._id,
            uuid: pdf.uuid,
            name: pdf.name,
            total_chunks: pdf.total_chunks
        }));

        res.status(200).json({
            success: true,
            message: `Successfully deleted ${pdfRecords.length} PDFs`,
            deleted_pdfs: deletedPDFs,
            total_deleted_vectors: totalDeletedVectors,
            deleted_at: new Date().toISOString()
        });

    } catch (error) {
        console.error("🔥 Internal error during bulk PDF deletion:", error);

        res.status(500).json({
            success: false,
            message: "Error while deleting PDFs",
            error: error.message
        });
    }
};

module.exports = {
    DeleteMultiplePDFsController
}