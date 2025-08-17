// // test-connections.js - Place this in your backend root folder
// require('dotenv').config();
// const mongoose = require('mongoose');
// const { MilvusClient } = require("@zilliz/milvus2-sdk-node");
// const cloudinary = require('cloudinary').v2;

// // Using single Cloudinary URL environment variable
// // Parse the Cloudinary URL manually since it's stored in CLOUDINARY_API_KEY
// const cloudinaryUrl = process.env.CLOUDINARY_API_KEY;
// if (cloudinaryUrl && cloudinaryUrl.startsWith('cloudinary://')) {
//     try {
//         // Parse: cloudinary://api_key:api_secret@cloud_name
//         const urlParts = cloudinaryUrl.replace('cloudinary://', '');
//         const [credentials, cloudName] = urlParts.split('@');
//         const [apiKey, apiSecret] = credentials.split(':');
        
//         cloudinary.config({
//             cloud_name: cloudName,
//             api_key: apiKey,
//             api_secret: apiSecret
//         });
        
//         console.log('✅ Cloudinary config parsed successfully');
//     } catch (error) {
//         console.log('❌ Failed to parse Cloudinary URL:', error.message);
//         // Fallback to cloudinary_url
//         cloudinary.config({
//             cloudinary_url: cloudinaryUrl
//         });
//     }
// } else {
//     console.log('❌ Invalid Cloudinary URL format');
// }


// // Colors for console output
// const colors = {
//     reset: '\x1b[0m',
//     green: '\x1b[32m',
//     red: '\x1b[31m',
//     yellow: '\x1b[33m',
//     blue: '\x1b[34m'
// };

// const log = (message, color = 'reset') => {
//     console.log(`${colors[color]}${message}${colors.reset}`);
// };

// const testConnections = async () => {
//     log('🔍 Starting connection diagnostics...', 'blue');

//     // Test 1: Environment Variables
//     log('\n📋 Step 1: Checking environment variables...', 'blue');
//     const requiredVars = [
//         'DEV_MONGODB_URI',
//         'MILVUS_ENDPOINT_ADDRESS',
//         'MILVUS_TOKEN',
//         'GEMINI_API_KEY',
//         'DEV_EMBEDDING_MODEL',
//         'CLOUDINARY_API_KEY'
//     ];

//     let envOk = true;
//     for (const varName of requiredVars) {
//         if (process.env[varName]) {
//             log(`✅ ${varName}: Set`, 'green');
//         } else {
//             log(`❌ ${varName}: Missing`, 'red');
//             envOk = false;
//         }
//     }

//     if (!envOk) {
//         log('\n❌ Some environment variables are missing. Please check your .env file.', 'red');
//         return;
//     }

//     // Test 2: MongoDB Connection
//     log('\n📋 Step 2: Testing MongoDB connection...', 'blue');
//     try {
//         log('🔄 Connecting to MongoDB...', 'yellow');

//         await mongoose.connect(process.env.DEV_MONGODB_URI, {
//             serverSelectionTimeoutMS: 10000,
//             connectTimeoutMS: 10000,
//             socketTimeoutMS: 45000,
//         });

//         log('✅ MongoDB connection successful!', 'green');

//         // Test a simple query
//         const db = mongoose.connection.db;
//         await db.admin().ping();
//         log('✅ MongoDB ping successful!', 'green');

//         await mongoose.disconnect();

//     } catch (error) {
//         log(`❌ MongoDB connection failed: ${error.message}`, 'red');

//         if (error.message.includes('ENOTFOUND')) {
//             log('💡 Suggestion: Check your internet connection and DNS settings', 'yellow');
//         }
//         if (error.message.includes('ECONNREFUSED')) {
//             log('💡 Suggestion: Check if MongoDB Atlas IP whitelist includes your IP', 'yellow');
//         }
//     }

//     // Test 3: Milvus Connection
//     log('\n📋 Step 3: Testing Milvus connection...', 'blue');
//     try {
//         log('🔄 Connecting to Milvus...', 'yellow');

//         const milvusClient = new MilvusClient({
//             address: process.env.MILVUS_ENDPOINT_ADDRESS,
//             token: process.env.MILVUS_TOKEN,
//             timeout: 30000
//         });

//         log('🔄 Testing Milvus operations...', 'yellow');

//         const collections = await Promise.race([
//             milvusClient.listCollections(),
//             new Promise((_, reject) =>
//                 setTimeout(() => reject(new Error('Milvus timeout after 30s')), 30000)
//             )
//         ]);

//         log('✅ Milvus connection successful!', 'green');
//         log(`✅ Found ${collections.data.length} collections`, 'green');

//         // Check if your collection exists
//         const targetCollection = 'RAG_TEXT_EMBEDDING';
//         const hasCollection = collections.data.some(col => col.name === targetCollection);

//         if (hasCollection) {
//             log(`✅ Target collection '${targetCollection}' exists`, 'green');
//         } else {
//             log(`⚠️  Target collection '${targetCollection}' not found`, 'yellow');
//             log('Available collections:', 'yellow');
//             collections.data.forEach(col => log(`  - ${col.name}`, 'yellow'));
//         }

//     } catch (error) {
//         log(`❌ Milvus connection failed: ${error.message}`, 'red');

//         if (error.message.includes('ENETUNREACH')) {
//             log('💡 Suggestion: Check your internet connection and firewall settings', 'yellow');
//         }
//         if (error.message.includes('timeout')) {
//             log('💡 Suggestion: Try increasing timeout or check network stability', 'yellow');
//         }
//     }

//     // Test 4: Cloudinary Connection
//     log('\n📋 Step 4: Testing Cloudinary connection...', 'blue');
//     try {
//         log('🔄 Testing Cloudinary configuration...', 'yellow');
        
//         // Check if configuration was set properly
//         const config = cloudinary.config();
//         log(`🔍 Debug - Cloud name: ${config.cloud_name || 'Not set'}`, 'yellow');
//         log(`🔍 Debug - API key: ${config.api_key || 'Not set'}`, 'yellow');
//         log(`🔍 Debug - API secret: ${config.api_secret ? 'Set' : 'Not set'}`, 'yellow');
        
//         if (!config.cloud_name || !config.api_key || !config.api_secret) {
//             throw new Error('Cloudinary configuration incomplete - missing cloud_name, api_key, or api_secret');
//         }
        
//         log(`✅ Cloud name: ${config.cloud_name}`, 'green');
//         log(`✅ API key: ${config.api_key.substring(0, 6)}...`, 'green');
        
//         log('🔄 Testing Cloudinary connection...', 'yellow');

//         const result = await cloudinary.api.ping();
//         log('✅ Cloudinary connection successful!', 'green');
//         log(`✅ Cloudinary status: ${result.status}`, 'green');

//         // Test basic upload capabilities (get cloud info)
//         try {
//             const cloudInfo = await cloudinary.api.resource_types();
//             log('✅ Cloudinary API access confirmed', 'green');
//             log(`✅ Available resource types: ${cloudInfo.resource_types.join(', ')}`, 'green');
//         } catch (apiError) {
//             log(`⚠️  Cloudinary API limited access: ${apiError.message}`, 'yellow');
//         }

//     } catch (error) {
//         log(`❌ Cloudinary connection failed: ${error.message}`, 'red');

//         if (error.message.includes('cloud_name')) {
//             log('💡 Suggestion: Check your CLOUDINARY_API_KEY format. It should be:', 'yellow');
//             log('   cloudinary://api_key:api_secret@cloud_name', 'yellow');
//         }
//         if (error.message.includes('Invalid API key')) {
//             log('💡 Suggestion: Verify your API key and secret are correct', 'yellow');
//         }
//         if (error.message.includes('ENOTFOUND') || error.message.includes('timeout')) {
//             log('💡 Suggestion: Check your internet connection', 'yellow');
//         }
        
//         // Debug: Show what we're trying to parse
//         log(`🔍 Debug: CLOUDINARY_API_KEY = ${process.env.CLOUDINARY_API_KEY || 'Not set'}`, 'yellow');
//     }

//     // Test 5: Network Diagnostics
//     log('\n📋 Step 5: Network diagnostics...', 'blue');

//     // Test DNS resolution
//     const dns = require('dns').promises;

//     try {
//         log('🔄 Testing DNS resolution for MongoDB...', 'yellow');
//         const mongoHost = process.env.DEV_MONGODB_URI.match(/mongodb\+srv:\/\/[^:]+@([^\/]+)/);
//         if (mongoHost && mongoHost[1]) {
//             await dns.lookup(mongoHost[1]);
//             log('✅ MongoDB DNS resolution successful', 'green');
//         }
//     } catch (error) {
//         log(`❌ MongoDB DNS resolution failed: ${error.message}`, 'red');
//     }

//     try {
//         log('🔄 Testing DNS resolution for Milvus...', 'yellow');
//         const url = process.env.MILVUS_ENDPOINT_ADDRESS.replace(/^https?:\/\//, '');
//         const milvusHost = url.split(':')[0];      // bare hostname
//         await dns.lookup(milvusHost);

//         log('✅ Milvus DNS resolution successful', 'green');
//     } catch (error) {
//         log(`❌ Milvus DNS resolution failed: ${error.message}`, 'red');
//     }

//     try {
//         log('🔄 Testing DNS resolution for Cloudinary...', 'yellow');
//         await dns.lookup('api.cloudinary.com');
//         log('✅ Cloudinary DNS resolution successful', 'green');
//     } catch (error) {
//         log(`❌ Cloudinary DNS resolution failed: ${error.message}`, 'red');
//     }

//     log('\n🎉 Connection diagnostics completed!', 'blue');
//     log('\n💡 If you see connection failures, try:', 'yellow');
//     log('   1. Check your internet connection', 'yellow');
//     log('   2. Try switching to mobile hotspot temporarily', 'yellow');
//     log('   3. Check if your firewall/antivirus is blocking connections', 'yellow');
//     log('   4. Verify your MongoDB Atlas IP whitelist', 'yellow');
//     log('   5. Verify your Zilliz cluster is active', 'yellow');
//     log('   6. Verify your Cloudinary credentials are correct', 'yellow');
// };

// // Run the test
// testConnections().catch(console.error);


const fs = require("fs");
const wav = require("wav");
const vosk = require("vosk");
const path = require("path");

const MODEL_PATH = path.join(__dirname, "model");
const AUDIO_FILE = path.join(__dirname, "670ca1b7-df4f-4c9c-b5a1-9a8392838a96_audio.wav");

if (!fs.existsSync(MODEL_PATH)) {
  console.error("Model folder not found! Download a Vosk model and unzip to ./model");
  process.exit(1);
}

const MODEL_SAMPLE_RATE = 16000;

const model = new vosk.Model(MODEL_PATH);
const rec = new vosk.Recognizer({ model: model, sampleRate: MODEL_SAMPLE_RATE });

const fileStream = fs.createReadStream(AUDIO_FILE);
const reader = new wav.Reader();

reader.on("format", (format) => {
  if (format.sampleRate !== MODEL_SAMPLE_RATE || format.channels !== 1) {
    console.error(`Audio must be mono WAV at ${MODEL_SAMPLE_RATE}Hz`);
    process.exit(1);
  }
});

reader.on("data", (data) => {
  rec.acceptWaveform(data);
});

reader.on("end", () => {
  const result = rec.finalResult();
  console.log("🎤 Transcribed Text:", result.text); // Logs the text
  rec.free();
  model.free();
});

fileStream.pipe(reader);
