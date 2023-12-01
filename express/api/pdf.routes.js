const express = require("express");
const router = express.Router();

module.exports = (PdfModel) => {
  // Example route to get all PDFs
  router.get("/pdfs", async (req, res) => {
    try {
      const pdfs = await PdfModel.find();
      res.json(pdfs);
    } catch (error) {
      console.error("Error fetching PDFs:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Example route to create a new PDF
  router.post("/pdfs", async (req, res) => {
    const { name, file } = req.body;

    try {
      const newPdf = await PdfModel.create({ name, file });
      res.status(201).json(newPdf);
    } catch (error) {
      console.error("Error creating PDF:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Add more routes as needed

  return router;
};
