const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  senderName: { type: String, required: true },   // user/admin name
  senderEmail: { type: String, required: true },  // optional, helps identify users
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Chat", chatSchema);
