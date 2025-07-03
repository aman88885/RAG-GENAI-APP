// ================== Validate .env ===================
export const validateEnvironmentVariables = () => {
    const required = [
        'GEMINI_API_KEY',
        'DEV_EMBEDDING_MODEL',
        'MILVUS_ENDPOINT_ADDRESS',
        'MILVUS_TOKEN',
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET'
    ];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
};
// ==================================================