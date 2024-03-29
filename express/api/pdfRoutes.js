// api/pdfRoutes.js

const express = require("express");
const PdfModel = require("../database/models/pdfModel");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Route to create a new PDF record
router.post("/upload", async (req, res) => {
  try {
    const { id, projectName, uploadFilePath, numPages } = req.body;
    console.log("The ID", id);
    const filePath = uploadFilePath;
    const absoluteFilePath = req.file.path;
    const newPdf = await PdfModel.uploadPDF(
      id,
      filePath,
      projectName,
      absoluteFilePath,
      numPages
    );
    res.json(newPdf);
  } catch (error) {
    console.error("Error creating PDF:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to create a new PDF record
router.post("/create", async (req, res) => {
  try {
    const { name, projectName, positionInArray, numPages } = req.body;

    // Check if a PDF with the same name and project name already exists
    const existingPdf = await PdfModel.findByProjectAndName(projectName, name);

    if (existingPdf) {
      const existingFilePath = existingPdf.absoluteFilePath;
      if (fs.existsSync(existingFilePath)) {
        fs.unlinkSync(existingFilePath);
        console.log("File deleted successfully:", existingFilePath);
      }
      await PdfModel.destroy({
        where: {
          id: existingPdf.id,
        },
      });

      console.log(
        `Existing PDF with name '${name}' and project '${projectName}' deleted.`
      );
    }

    // Create the new PDF
    const newPdf = await PdfModel.createNewPdf(
      name,
      projectName,
      positionInArray,
      numPages
    );
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
    const { projectName, uploadFilePath, numPages } = req.body;
    const filePath = uploadFilePath;
    const absoluteFilePath = req.file.path;

    // Update PDF details in the database
    const updatedPdf = await PdfModel.updatePDF(
      pdfId,
      filePath,
      projectName,
      absoluteFilePath,
      numPages
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

// Update the server-side route
router.put("/updatePositions/:projectName", async (req, res) => {
  try {
    const projectName = req.params.projectName;
    const updatedPdfs = req.body.updatedPdfs;

    // Update positions in the database for each PDF in the specified project
    const updatePromises = updatedPdfs.map(async (updatedPdf) => {
      const { id, newPosition } = updatedPdf;
      return await PdfModel.update(
        { positionInArray: newPosition },
        { where: { id, projectName } }
      );
    });

    await Promise.all(updatePromises);

    res.json({ message: "Positions updated successfully" });
  } catch (error) {
    console.error("Error updating PDF positions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/updateBauteil/:id", async (req, res) => {
  try {
    const pdfId = req.params.id;
    const { bauteil } = req.body;

    // Update the 'bauteil' field in the database
    const updatedPdf = await PdfModel.update(
      { bauteil },
      { where: { id: pdfId } }
    );

    res.json(updatedPdf);
  } catch (error) {
    console.error("Error updating bauteil:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update the server-side route
router.put("/updateName/:id", async (req, res) => {
  try {
    const pdfId = req.params.id;
    const { newName } = req.body;

    // Update the 'name' field in the database
    const updatedPdf = await PdfModel.update(
      { name: newName },
      { where: { id: pdfId } }
    );

    res.json(updatedPdf);
  } catch (error) {
    console.error("Error updating PDF name:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
