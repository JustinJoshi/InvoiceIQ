const fs = require("fs");
const PDFParser = require("pdf2json");

const pdfParser = new PDFParser(this, 1);

pdfParser.on("pdfParser_dataError", (errData) =>
 console.error(errData.parserError)
);
pdfParser.on("pdfParser_dataReady", (pdfData) => {
 fs.writeFile(
  "./downloads/convertedText/output.txt",
    pdfParser.getRawTextContent(),
    () => {
    console.log("PDF successfully converted to txt");
  }
 );
 fs.writeFile(
  "./downloads/convertedPDFs/output.json",
  JSON.stringify(pdfData),
  (data) => console.log("PDF successfully converted to json. Maybe add separate button for txt later")
 );
});




module.exports = convertPdf = (path) => pdfParser.loadPDF(`${path}`);