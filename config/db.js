const mongoose = require("mongoose");
require("dotenv").config({ path: ".env" });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("DB connected!");
  } catch (error) {
    console.log("There was a Error!!!");
    console.log(error);
    process.exit(1); // Stop app
  }
};

module.exports = connectDB;
