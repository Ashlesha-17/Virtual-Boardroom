const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");

// TEMP AUTH (use real JWT later)
router.use((req, res, next) => {
  req.user = {
    name: "User",                // replace with req.user.name after auth
    email: "ash@gmail.com",      // replace with req.user.email
    role: "user",
  };
  next();
});

// GET all chat messages
router.get("/", async (req, res) => {
  try {
    const chats = await Chat.find().sort({ createdAt: 1 }); // oldest first
    res.json(chats);
  } catch (err) {
    console.error("GET /api/chat error:", err);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
});

// POST a new message
router.post("/", async (req, res) => {
  try {
    const { message, senderName, senderEmail } = req.body;

    if (!message) return res.status(400).json({ message: "Message required" });

    const newChat = new Chat({
      senderName: senderName || "Unknown",
      senderEmail: senderEmail || "unknown@example.com",
      message: message.trim(),
    });

    await newChat.save();

    // Emit via socket.io
    const io = req.app.get("io");
    io.emit("chat:new", newChat);

    res.status(201).json(newChat);
  } catch (err) {
    console.error("POST /api/chat error:", err);
    res.status(400).json({ message: err.message });
  }
});


module.exports = router;
