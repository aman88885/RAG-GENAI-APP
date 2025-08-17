# 🔧 Troubleshooting Guide

## 🚨 405 Error - Method Not Allowed

If you're seeing a 405 error when trying to sign in, follow these steps:

### 1. Check if Backend is Running

```bash
# Navigate to backend directory
cd backend

# Check if node_modules exists
ls node_modules

# If not, install dependencies
npm install

# Start the backend server
npm run dev
```

You should see: `Server is running on port 4000 & environment is development`

### 2. Check Environment Variables

Create a `.env` file in the `backend/` directory:

```env
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
```

### 3. Check Frontend Environment

Create a `.env` file in the `frontend/` directory:

```env
VITE_BACKEND_API=http://localhost:4000
```

### 4. Test Backend Connectivity

```bash
# Run the connectivity test
node check-backend.js
```

### 5. Common Issues & Solutions

#### Issue: Backend won't start
- **Solution**: Check if port 4000 is already in use
- **Fix**: Change PORT in backend/.env or kill the process using port 4000

#### Issue: MongoDB connection failed
- **Solution**: Verify your MongoDB connection string
- **Fix**: Check if your IP is whitelisted in MongoDB Atlas

#### Issue: Environment variables not loading
- **Solution**: Make sure .env files are in the correct directories
- **Fix**: Restart the server after creating .env files

#### Issue: CORS errors
- **Solution**: Backend has CORS enabled, but check if frontend URL is correct
- **Fix**: Verify VITE_BACKEND_API in frontend/.env

### 6. Debug Steps

1. **Check Backend Console**: Look for error messages when starting the server
2. **Check Network Tab**: In browser dev tools, see the actual request being made
3. **Test API Endpoint**: Use curl or Postman to test the endpoint directly

```bash
# Test with curl
curl -X POST http://localhost:4000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

### 7. Expected Response Codes

- **401**: Invalid credentials (normal for wrong password)
- **400**: Bad request (missing fields)
- **409**: User already exists (signup)
- **500**: Server error (check backend logs)
- **405**: Method not allowed (routing issue)
- **404**: Endpoint not found (routing issue)

### 8. Quick Fix Checklist

- [ ] Backend server is running on port 4000
- [ ] Frontend .env has correct VITE_BACKEND_API
- [ ] Backend .env has all required variables
- [ ] MongoDB is accessible
- [ ] No firewall blocking localhost:4000
- [ ] Both frontend and backend are using the same port

### 9. Still Having Issues?

1. Check the backend console for specific error messages
2. Verify all environment variables are set correctly
3. Try restarting both frontend and backend servers
4. Clear browser cache and try again
5. Check if any antivirus/firewall is blocking the connection

