# 🧠 RAG GenAI App

This is a **full-stack Retrieval-Augmented Generation (RAG)** based application that enables users to upload PDF documents and interact with their contents using natural language. The system retrieves relevant information from document embeddings and generates context-aware answers using **Google Gemini LLM**.

## 🚀 Workflow

<img width="957" alt="Screenshot 2025-03-25 at 2 00 20 AM" src="https://github.com/user-attachments/assets/278d4ee1-115d-4564-8955-19bcca4daee3" />

---

## 🔧 Backend Tech Stack

- **Node.js** – Runtime for executing server-side logic  
- **Express.js** – Web framework for building RESTful APIs  
- **Multer** – File upload handler (PDFs)  
- **pdf-parse** – For extracting text from PDFs  
- **Mongoose (MongoDB)** – Data modeling and storage  
- **Milvus** (`@zilliz/milvus2-sdk-node`) – Vector database for document embeddings  
- **@google/generative-ai** – Used for:
  - Generating embeddings
  - Generating answers via **Google Gemini LLM**
- **JWT + bcrypt** – For user authentication and password security  
- **Joi** – Request validation  
- **Cloudinary** – PDF file cloud storage  
- **uuid** – For generating unique document identifiers  
- **dotenv, cors, path, fs, http-status** – Utility modules and middleware 

---

## 🖥️ Frontend Tech Stack

- **React.js** – Component-based frontend framework  
- **TypeScript** – Type-safe JavaScript  
- **Tailwind CSS** – Utility-first CSS framework for modern UI  
- **React Router** – For routing and navigation  
- **ShadCN/UI** – For polished and accessible UI components  
- **Axios** – For making HTTP requests to the backend  
- **React Hot Toast** – For user notifications  
- **Lucide Icons** – For modern iconography  
- **Framer Motion** – For animations and transitions

---

## ✨ Key Features

- 🔐 **User Authentication** – Secure login/signup using JWT
- 📄 **Upload PDFs** – Upload documents which are indexed and stored in Cloudinary
- 🧠 **Chat with Documents** – Ask natural language questions and get context-aware answers
- 💬 **Real-Time Chat UI** – Seamless conversational interface
- 📊 **Dashboard View** – See all your uploaded documents with options to chat, delete, or view info
- 🧾 **Document Metadata** – View page count, upload date, file size, and indexing status
- 📥 **Upload Guidelines** – Clear UI for supported formats and file limits

---

## ⚙️ Project Setup Instructions

### 📁 1. Clone the Repository
```bash
git clone https://github.com/aman3255/rag-genai-app.git
cd rag-genai-app
```

### 🧠 2. Backend Setup
```bash
cd backend
npm install
```

#### ✅ Create .env File
Inside the `/backend` folder, create a `.env` file and add the following:

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
```

### 💻 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

This will launch the frontend on `http://localhost:5173` by default (or as configured in `vite.config.ts`).

### ✅ 4. Run Backend Server
From the `backend/` directory:
```bash
npm run dev
```

Your backend will run on `http://localhost:4000`
