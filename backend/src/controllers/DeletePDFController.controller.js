require('dotenv').config();
const PDFSModel = require('../models/pdfs.model');
const USERSModel = require('../models/users.model');
const { validateEnvironmentVariables } = require('../utils/validateEnvironmentVariables.utils');
const { deletePDFFromCloudinary } = require('../config/cloudinary.config');


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




// =================== CONTROLLERS ===================


const DeletePDFController = async (req, res) => {
    try {
        console.log("🗑️ Request received to delete PDF");

        // Validate environment variables
        validateEnvironmentVariables();

        const { pdfId } = req.params; // Can be either MongoDB _id or UUID
        const userId = req.userId; // From auth middleware

        if (!pdfId) {
            return res.status(400).json({
                success: false,
                message: "PDF ID is required"
            });
        }

        // Find PDF record by either _id or uuid
        let pdfRecord;
        
        // Check if pdfId is a valid MongoDB ObjectId (24 hex characters)
        if (pdfId.match(/^[0-9a-fA-F]{24}$/)) {
            pdfRecord = await PDFSModel.findById(pdfId);
        } else {
            // Assume it's a UUID
            pdfRecord = await PDFSModel.findOne({ uuid: pdfId });
        }

        if (!pdfRecord) {
            return res.status(404).json({
                success: false,
                message: "PDF not found"
            });
        }

        // Check if user owns this PDF
        if (pdfRecord.uploaded_by.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to delete this PDF"
            });
        }

        console.log(`📋 Found PDF record: ${pdfRecord.name} (UUID: ${pdfRecord.uuid})`);

        // Delete vectors from Milvus first
        let deletedVectorCount = 0;
        
        try {
            const milvusDeleteResponse = await milvusClient.delete({
                collection_name: "RAG_TEXT_EMBEDDING",
                filter: `pdf_uuid == "${pdfRecord.uuid}"`
            });

            deletedVectorCount = milvusDeleteResponse.delete_cnt || 0;
            console.log(`✅ Deleted ${deletedVectorCount} vectors from Milvus`);

        } catch (milvusError) {
            console.error("❌ Error deleting vectors from Milvus:", milvusError);
            
            // Continue with database deletion even if Milvus deletion fails
            // Log the error but don't fail the entire operation
            console.warn("⚠️ Continuing with database deletion despite Milvus error");
        }


          // Delete from Cloudinary
          const cloudinaryResult = await deletePDFFromCloudinary(pdfRecord.cloudinary_public_id);
        
          if (!cloudinaryResult.success) {
              console.warn("⚠️ Failed to delete from Cloudinary:", cloudinaryResult.error);
          }

        // Delete PDF record from MongoDB
        await PDFSModel.findByIdAndDelete(pdfRecord._id);
        console.log(`✅ Deleted PDF record from database`);

        console.log(`🗑️ PDF deletion completed for ${pdfRecord.name}`);

        res.status(200).json({
            success: true,
            message: "PDF deleted successfully",
            deleted_pdf: {
                id: pdfRecord._id,
                uuid: pdfRecord.uuid,
                name: pdfRecord.name,
                original_name: pdfRecord.original_name,
                total_chunks: pdfRecord.total_chunks,
                deleted_vectors: deletedVectorCount,
                cloudinary_deleted: cloudinaryResult.success,
                deleted_at: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error("🔥 Internal error during PDF deletion:", error);

        res.status(500).json({
            success: false,
            message: "Error while deleting PDF",
            error: error.message
        });
    }
};

module.exports = {
    DeletePDFController
}