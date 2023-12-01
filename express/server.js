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

  // Angular
  app.use("/", express.static(__dirname + "/angular/dist/statikgenerator"));

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
