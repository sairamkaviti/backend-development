const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    companyName: String,
    location: {
      state: String,
      city: String,
    },
    email: { type: String, unique: true },
    mobile: String,
    password: String,
    userType: {
      type: String,
      enum: ["Individual", "Company"],
      default: "Individual",
    },
    profilePicUrl: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
