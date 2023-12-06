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
  absoluteFilePath: {
    type: DataTypes.STRING,
  },
  positionInArray: {
    type: DataTypes.NUMBER,
    allowNull: false,
  },
});

// Methods for creating and retrieving data
PdfModel.createNewPdf = async (name, projectName, positionInArray) => {
  return PdfModel.create({ name, projectName, positionInArray });
};

PdfModel.uploadPDF = async (id, filePath, projectName, absoluteFilePath) => {
  return PdfModel.update(
    { filePath, absoluteFilePath },
    { where: { id, projectName } }
  );
};

PdfModel.getAllPdfs = async () => {
  return PdfModel.findAll();
};

PdfModel.getAllPdfsByProjectName = async (projectName) => {
  const files = await PdfModel.findAll({
    where: {
      projectName: projectName,
    },
  });
  return files;
};

PdfModel.updatePDF = async (id, filePath, projectName, absoluteFilePath) => {
  return PdfModel.update(
    { filePath, absoluteFilePath },
    { where: { id, projectName } }
  );
};

PdfModel.findByProjectAndName = async (projectName, name) => {
  return PdfModel.findOne({
    where: {
      projectName: projectName,
      name: name,
    },
  });
};
module.exports = PdfModel;
