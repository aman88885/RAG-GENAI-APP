require('dotenv').config();
const PDFSModel = require('../models/pdfs.model');

// =================== CONTROLLERS ===================


// Get user's PDFs (owned, shared, and public)
const GetUserPDFsController = async (req, res) => {
    try {
        const userId = req.userId;
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

module.exports = {
    GetUserPDFsController
}