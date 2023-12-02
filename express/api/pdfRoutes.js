// api/pdfRoutes.js

const express = require("express");
const PdfModel = require("../database/models/pdfModel");

const router = express.Router();

// Route to create a new PDF record
router.post("/upload", async (req, res) => {
  try {
    const { id, projectName } = req.body;
    console.log("The ID", id);
    const filePath = req.file.path;
    const newPdf = await PdfModel.uploadPDF(id, filePath, projectName);
    res.json(newPdf);
  } catch (error) {
    console.error("Error creating PDF:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { name, projectName } = req.body;
    const newPdf = await PdfModel.createNewPdf(name, projectName);
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

// Add this route after your existing code

router.get("/files/:projectName", async (req, res) => {
  try {
    const projectName = req.params.projectName;

    const files = await PdfModel.getAllPdfsByProjectName(projectName);

    res.json({ files });
  } catch (error) {
    console.error("Error retrieving files:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
