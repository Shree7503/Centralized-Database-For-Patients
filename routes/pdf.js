const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const generatePdfPrescription = async (req, res) =>{
    try {
        const userID = req.params.id;
        const browser = await puppeteer.launch();
       const page = await browser.newPage();
       await page.goto(`${req.protocol}://${req.get('host')}`+`/pdfReport/${userID}`, {
        waitUntil: "networkidle2"
       });

       await page.setViewport({width: 1680, height: 1050});

       const todaysDate = new Date();
       const pdfn = await page.pdf({
        path: `${path.join(__dirname, "../public/pdfs/", todaysDate.getTime()+".pdf")}`, 
        format: "A4"
       });

       await browser.close();

       const pdfURL =  `${path.join(__dirname, "../public/pdfs/", todaysDate.getTime()+".pdf")}`;

       res.set({
        "Content-Type": "application/pdf",
        "Content-Length": pdfn.length
       });
       res.sendFile(pdfURL);

    }catch(error) {
        console.log(error.message);
    }
}

module.exports = {
    generatePdfPrescription
}