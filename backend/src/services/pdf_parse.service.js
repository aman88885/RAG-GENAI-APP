const fs = require('fs');
const pdfParse = require('pdf-parse');

const ConvertPDFToText = async (pdfFilePath) => {
    try {
        const dataBuffer = fs.readFileSync(pdfFilePath); // Read file buffer
        const data = await pdfParse(dataBuffer); // Parse PDF
        // console.log("PDF Text Content:\n", data); // Log text

        return data.text; // Optional: return if needed elsewhere
    } catch (error) {
        console.error("Error while converting PDF to text:", error);
    }
};

module.exports = ConvertPDFToText;