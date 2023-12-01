// database/models/pdfModel.js

const { DataTypes } = require("sequelize");
const sequelize = require("../sequelize");

const PdfModel = sequelize.define("PdfModel", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filePath: {
    type: DataTypes.STRING,
  },
});

// Methods for creating and retrieving data
PdfModel.createNewPdf = async (name, filePath) => {
  return PdfModel.create({ name, filePath });
};

PdfModel.getAllPdfs = async () => {
  return PdfModel.findAll();
};

module.exports = PdfModel;
