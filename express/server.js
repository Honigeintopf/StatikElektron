// server.js

module.exports = () => {
  const express = require("express");
  const path = require("path");
  const bodyParser = require("body-parser");

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

  // Load API routes
  const pdfRoutes = require("./api/pdfRoutes");
  app.use("/api/pdf", pdfRoutes);

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
