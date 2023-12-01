// pdfModel.js

const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize"); // Adjust the path if needed

const PdfModel = sequelize.define("PdfModel", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  file: {
    type: DataTypes.STRING,
  },
});

module.exports = PdfModel;
