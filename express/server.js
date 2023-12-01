module.exports = () => {
  const express = require("express");
  const mongoose = require("mongoose");

  const app = express();

  // parser
  const bodyParser = require("body-parser");
  app.use(bodyParser.json());

  // logger
  const morgan = require("morgan");
  app.use(morgan("dev"));

  // MongoDB connection
  mongoose.connect("mongodb://localhost:27017/monsegoo", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;

  db.on("error", console.error.bind(console, "MongoDB connection error:"));
  db.once("open", () => {
    console.log("Connected to MongoDB");
  });

  // Define your models and schema here using Mongoose
  const PdfSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    file: String,
  });

  const PdfModel = mongoose.model("PdfModel", PdfSchema);

  // Angular
  app.use("/", express.static(__dirname + "/angular/dist/statikgenerator"));

  // API routes
  const pdfRoutes = require("./api/pdf.routes")(PdfModel);
  app.use("/api", pdfRoutes);

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
