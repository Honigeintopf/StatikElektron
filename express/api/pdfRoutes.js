// api/pdfRoutes.js

const express = require("express");
const PdfModel = require("../database/models/pdfModel");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Route to create a new PDF record
router.post("/upload", async (req, res) => {
  try {
    const { id, projectName, uploadFilePath } = req.body;
    console.log("The ID", id);
    const filePath = uploadFilePath;
    const absoluteFilePath = req.file.path;
    const newPdf = await PdfModel.uploadPDF(
      id,
      filePath,
      projectName,
      absoluteFilePath
    );
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

router.get("/filePaths/:projectName", async (req, res) => {
  try {
    const projectName = req.params.projectName;

    const files = await PdfModel.getAllPdfPathsByProjectName(projectName);

    res.json({ files });
  } catch (error) {
    console.error("Error retrieving files:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const pdfId = req.params.id;

    // Retrieve the PDF record from the database
    const pdfToDelete = await PdfModel.findByPk(pdfId);

    if (!pdfToDelete) {
      return res.status(404).json({ error: "PDF not found" });
    }

    // Delete the file using the absolute file path from the database
    const absoluteFilePath = pdfToDelete.absoluteFilePath;

    if (fs.existsSync(absoluteFilePath)) {
      fs.unlinkSync(absoluteFilePath);
      console.log("File deleted successfully:", absoluteFilePath);
    }

    // Delete the PDF record from the database
    await PdfModel.destroy({
      where: {
        id: pdfId,
      },
    });

    res.json({ message: "PDF deleted successfully" });
  } catch (error) {
    console.error("Error deleting PDF:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/update/:id", async (req, res) => {
  try {
    const pdfId = req.params.id;
    const { projectName, uploadFilePath } = req.body;
    const filePath = uploadFilePath;
    const absoluteFilePath = req.file.path;

    // Update PDF details in the database
    const updatedPdf = await PdfModel.updatePDF(
      pdfId,
      filePath,
      projectName,
      absoluteFilePath
    );

    res.json(updatedPdf);
  } catch (error) {
    console.error("Error updating PDF:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/deleteFileOnly/:id", async (req, res) => {
  try {
    const pdfId = req.params.id;

    const pdfToDelete = await PdfModel.findByPk(pdfId);

    if (!pdfToDelete) {
      return res.status(404).json({ error: "PDF not found" });
    }

    const absoluteFilePath = pdfToDelete.absoluteFilePath;

    if (fs.existsSync(absoluteFilePath)) {
      fs.unlinkSync(absoluteFilePath);
      console.log("File deleted successfully:", absoluteFilePath);
    }

    res.json({ message: "PDF deleted successfully" });
  } catch (error) {
    console.error("Error deleting PDF:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
