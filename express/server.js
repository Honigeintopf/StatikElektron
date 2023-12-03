// server.js

module.exports = () => {
  const express = require("express");
  const path = require("path");
  const bodyParser = require("body-parser");
  const multer = require("multer");
  const fs = require("fs");

  const app = express();

  // parser
  app.use(bodyParser.json());

  // logger
  const morgan = require("morgan");
  app.use(morgan("dev"));

  // Load database initialization
  const sequelize = require("./database/sequelize");

  // Load the PdfModel
  const PdfModel = require("./database/models/pdfModel");

  // Synchronize the model with the database
  sequelize
    .sync({ force: true }) // Use { force: true } to drop existing tables on every app start (for development only)
    .then(() => {
      console.log("Database synchronized");
    })
    .catch((error) => {
      console.error("Error synchronizing database:", error);
    });

  // Angular
  app.use(
    "/",
    express.static(path.join(__dirname, "angular/dist/statikgenerator"))
  );

  // Serve uploaded files
  const desktopPath = path.join(require("os").homedir(), "Desktop");
  const uploadFolderPath = path.join(desktopPath, "allPdfUploads");

  // Create the 'uploads' folder if it doesn't exist
  if (!fs.existsSync(uploadFolderPath)) {
    fs.mkdirSync(uploadFolderPath);
  }

  app.use("/assets/allPdfUploads", express.static(uploadFolderPath));

  // Configure Multer for file uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadFolderPath); // Use the desktop 'uploads' folder
    },
    filename: (req, file, cb) => {
      cb(null, `${file.originalname}`); // Use a unique filename
    },
  });

  const upload = multer({ storage: storage });

  // Load API routes
  const pdfRoutes = require("./api/pdfRoutes");

  // Use Multer middleware for file uploads in the /api/pdf/create route
  app.use("/api/pdf", upload.single("file"), pdfRoutes);

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
