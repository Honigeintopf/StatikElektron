// api/pdfRoutes.js

const express = require("express");
const PdfModel = require("../database/models/pdfModel");

const router = express.Router();

// Route to create a new PDF record
router.post("/create", async (req, res) => {
  try {
    const { name, filePath } = req.body;
    console.log(req.body);
    const newPdf = await PdfModel.createNewPdf(name, filePath);
    res.json(newPdf);
  } catch (error) {
    console.error("Error creating PDF:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to get all PDF records
router.get("/all", async (req, res) => {
  try {
    const allPdfs = await PdfModel.getAllPdfs();
    res.json(allPdfs);
  } catch (error) {
    console.error("Error getting all PDFs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
