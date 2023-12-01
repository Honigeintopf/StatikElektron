// database/sequelize.js

const { Sequelize } = require("sequelize");
const path = require("path");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "../your-database-name.sqlite"), // Adjust the path if needed
});

module.exports = sequelize;
