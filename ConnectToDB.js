const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

let connectMDB = async () => {
  try {
    await mongoose.connect(process.env.MDBURL);
    console.log("Successfully connected To DB");
  } catch (error) {
    console.log("unable to connect DB");
  }
};

module.exports = connectMDB;
