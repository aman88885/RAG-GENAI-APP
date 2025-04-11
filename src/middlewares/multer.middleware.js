const multer = require('multer');
const path = require('path');

// Configure storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Define where to save the uploaded files
        cb(null, 'uploads/pdfs'); // Ensure this folder exists or create it - All the uploaded files will be saved in the 'uploads/pdfs' directory
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use the original file name
    }
});

// File filter to accept only PDFs
const fileFilter = (req, file, cb) => {
    const allowedTypes = /pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true); // Accept the file
    } else {
        return cb(new Error('Only PDF files are allowed'), false); // Reject non-PDFs
    }
};

// Create multer middleware for a single PDF file
const uploadPDF = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limit file size to 5MB
    }
}).single('pdf'); // 'pdf' is the field name in the form-data request

// Middleware function to handle the upload
const multerMiddleware = (req, res, next) => {
    uploadPDF(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer-specific error (e.g., file too large)
            return res.status(400).json({ error: `Multer error: ${err.message}` });
        } else if (err) {
            // A custom error (e.g., invalid file type)
            return res.status(400).json({ error: err.message });
        }
        // File uploaded successfully, proceed to the next middleware/controller
        next();
    });
};

module.exports = multerMiddleware;