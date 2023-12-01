module.exports = () => {
  const mongoose = require("mongoose");

  const start = async () => {
    try {
      await mongoose.connect(
        "mongodb://root:root@127.0.0.1:27017/mongoose?authSource=admin"
      );
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  };
};
