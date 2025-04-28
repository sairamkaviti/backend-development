const mongoose = require("mongoose");

const actionLogSchema = new mongoose.Schema(
  {
    actionType: { type: String, required: true }, // e.g., 'connection_update', 'message_sent', etc.
    actionData: { type: mongoose.Schema.Types.Mixed, required: true }, // Store relevant data about the action
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActionLog", actionLogSchema);
