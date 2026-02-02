const express = require("express");
const router = express.Router();
const User = require("../models/User");

// TEMP AUTH (optional)
router.use((req, res, next) => {
  req.user = {
    id: "697f150fec6d7bfbc041330e",
    role: "admin",
  };
  next();
});

// GET all normal users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("name email");
    res.json(users);
  } catch (err) {
    console.error("GET /api/users error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

module.exports = router;
