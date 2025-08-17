#!/bin/bash

echo "🚀 Setting up environment files for RAG GenAI App..."

# Create backend .env file
echo "📝 Creating backend .env file..."
cat > backend/.env << 'EOF'
# App Configuration
PORT=4000
NODE_ENV=development

# MongoDB
DEV_MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/RAG-GENAI-APP

# JWT
JWT_SECRET_KEY=<your_jwt_secret_key>

# Google Gemini API
GEMINI_API_KEY=<your_gemini_api_key>
DEV_EMBEDDING_MODEL=gemini-embedding-exp-03-07
DEV_GENERATIVE_MODEL=gemini-2.0-flash

# Milvus (Vector DB)
MILVUS_ENDPOINT_ADDRESS=<your_milvus_endpoint>
MILVUS_TOKEN=<your_milvus_token>

# Cloudinary (Single URL format)
CLOUDINARY_API_KEY=cloudinary://<api_key>:<api_secret>@<cloud_name>
EOF

# Create frontend .env file
echo "📝 Creating frontend .env file..."
cat > frontend/.env << 'EOF'
# App Configuration
VITE_BACKEND_API=http://localhost:4000
EOF

echo "✅ Environment files created successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit backend/.env with your actual API keys and database credentials"
echo "2. Start the backend: cd backend && npm run dev"
echo "3. Start the frontend: cd frontend && npm run dev"
echo ""
echo "🔗 Backend will run on: http://localhost:4000"
echo "🔗 Frontend will run on: http://localhost:5173"
