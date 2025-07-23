// ================ Chunking Function ===================
export const chunkText = (text, chunkSize = null, overlap = null) => {
    const words = text.split(/\s+/);
    const wordCount = words.length;
  
    // Default values based on document size
    if (!chunkSize || !overlap) {
      if (wordCount <= 500) {
        chunkSize = 250;
        overlap = 50;
      } else if (wordCount <= 2000) {
        chunkSize = 500;
        overlap = 100;
      } else if (wordCount <= 5000) {
        chunkSize = 1000;
        overlap = 150;
      } else {
        chunkSize = 1500;
        overlap = 200;
      }
    }
  
    const chunks = [];
    for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      if (chunk.trim()) {
        chunks.push(chunk.trim());
      }
    }
  
    return chunks;
  };
  

// "The quick brown fox jumps over the lazy dog"
// [The, quick, brown, fox, jumps, over, the, lazy, dog]

// ==================================================