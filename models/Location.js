const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema(
  {
    state: { type: String, required: true },
    city: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Location", locationSchema);
