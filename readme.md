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
- **dotenv, cors, uuid, path, fs, http-status** – Utility modules and middleware  

---

## 🖥️ Frontend

**Frontend is under construction** – built with React.js + TypeScript + Tailwind CSS.

---
