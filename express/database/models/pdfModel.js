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
  projectName: {
    type: DataTypes.STRING,
  },
});

// Methods for creating and retrieving data
PdfModel.createNewPdf = async (name, filePath, projectName) => {
  return PdfModel.create({ name, filePath, projectName });
};

PdfModel.getAllPdfs = async () => {
  return PdfModel.findAll();
};

module.exports = PdfModel;
