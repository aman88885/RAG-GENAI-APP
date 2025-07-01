// ================ Chunking Function ===================
export const chunkText = (text, chunkSize = 1000, overlap = 100) => {
    const words = text.split(/\s+/);
    const chunks = [];

    for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
        const chunk = words.slice(i, i + chunkSize).join(' ');
        if (chunk.trim()) {
            chunks.push(chunk.trim());
        }
    }

    return chunks;
};
// ==================================================