const mongoose = require("mongoose");

const MeetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  meetLink: { type: String, required: true },
  isLive: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // optional admin
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Auto-update updatedAt before save
MeetingSchema.pre("save", function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model("Meeting1", MeetingSchema);
