const { MilvusClient } = require("@zilliz/milvus2-sdk-node");
require('dotenv').config();


const MILVUS_ENDPOINT_ADDRESS = process.env.MILVUS_ENDPOINT_ADDRESS;
const MILVUS_TOKEN = process.env.MILVUS_TOKEN;

const client = new MilvusClient({
    address: MILVUS_ENDPOINT_ADDRESS,
    token: MILVUS_TOKEN,
    timeout: 60000
});

const StoreVectorEmbeddingOfChunkInMilvusVectorDBUtil = async (chunk_vector_embedding,chunk) => {
    try {
        const milvusResponse = await client.insert({
            collection_name : "RAG_TEXT_EMBEDDING",
            data : [
                {
                    vector_embedding : chunk_vector_embedding,
                    text : chunk
                }
            ]
        })

        if(milvusResponse.insert_cnt == 1){
            console.log("Chunk vector embedding stored in Milvus Vector DB successfully");
            return {
                success : true,
                message : "Chunk vector embedding stored in Milvus Vector DB successfully",
                data : milvusResponse
            }
        }else if(milvusResponse.insert_cnt == 0){
            console.log("Chunk vector embedding not stored in Milvus Vector DB");
            return {
                success : false,
                message : "Chunk vector embedding not stored in Milvus Vector DB"
            }
        }
    } catch (error) {
        console.log(`Error in StoreVectorEmbeddingOfChunkInMilvusVectorDBUtil: ${error}`);
        return {
            success : false,
            message : "Error in StoreVectorEmbeddingOfChunkInMilvusVectorDBUtil",
            error : error
        }
        
    }
}

module.exports = {
    StoreVectorEmbeddingOfChunkInMilvusVectorDBUtil
};