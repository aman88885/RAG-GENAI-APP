// controllers/query.controller.js
require('dotenv').config();
const { MilvusClient } = require('@zilliz/milvus2-sdk-node');

const MILVUS_ENDPOINT_ADDRESS = process.env.MILVUS_ENDPOINT_ADDRESS;
const MILVUS_TOKEN = process.env.MILVUS_TOKEN;



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


// Optional: Controller to get PDF metadata by UUID
const GetPDFInfoController = async (req, res) => {
    try {
        const { uuid } = req.params;

        if (!uuid || typeof uuid !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Valid PDF UUID is required'
            });
        }

        console.log('Getting PDF info for UUID:', uuid);

        // Query to get PDF metadata
        const milvusResponse = await milvusClient.query({
            collection_name: 'RAG_TEXT_EMBEDDING',
            filter: `pdf_uuid == "${uuid}"`,
            output_fields: ['pdf_name', 'pdf_uuid', 'created_at', 'chunk_index'],
            limit: 1
        });

        if (!milvusResponse.data || milvusResponse.data.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'PDF not found with the provided UUID'
            });
        }

        // Count total chunks for this PDF
        const countResponse = await milvusClient.query({
            collection_name: 'RAG_TEXT_EMBEDDING',
            filter: `pdf_uuid == "${uuid}"`,
            output_fields: ['chunk_index']
        });

        const pdfInfo = milvusResponse.data[0];
        res.status(200).json({
            success: true,
            pdf_uuid: uuid,
            pdf_name: pdfInfo.pdf_name,
            created_at: pdfInfo.created_at,
            total_chunks: countResponse.data.length,
            chat_endpoint: `http://localhost:4000/api/v1/pdf/query/ask/${uuid}`
        });

    } catch (error) {
        console.error('Error in GetPDFInfoController:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving PDF information: ' + error.message
        });
    }
};

module.exports = {
    GetPDFInfoController
}