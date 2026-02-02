const express = require("express");
const router = express.Router();
const Meeting = require("../models/Meeting1"); // correct model name

// GET all meetings
router.get("/", async (req, res) => {
  try {
    const meetings = await Meeting.find().sort({ createdAt: -1 });
    res.json(meetings);
  } catch (err) {
    console.error("GET /api/meeting error:", err);
    res.status(500).json({ message: "Failed to fetch meetings" });
  }
});

// POST create/start a new meeting
router.post("/", async (req, res) => {
  console.log("POST /api/meeting body:", req.body); 
  try {
    const { title, meetLink, createdBy } = req.body;

    // ✅ Validate required fields
    if (!title || !meetLink) {
      return res.status(400).json({ message: "Title and meetLink are required" });
    }

    // Create new meeting
    const newMeeting = new Meeting({
      title: title.trim(),
      meetLink: meetLink.trim(),
      isLive: true,
      createdBy,
    });

    await newMeeting.save();

    // Emit new meeting via socket.io
    const io = req.app.get("io");
    io.emit("meeting:start", newMeeting);

    res.status(201).json(newMeeting);
  } catch (err) {
    console.error("POST /api/meeting error:", err);
    res.status(400).json({ message: err.message });
  }
});

// PUT update meeting (end meeting)
router.put("/:id/end", async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    meeting.isLive = false;
    meeting.updatedAt = Date.now();
    await meeting.save();

    // Emit meeting end via socket.io
    const io = req.app.get("io");
    io.emit("meeting:end", meeting);

    res.json(meeting);
  } catch (err) {
    console.error(`PUT /api/meeting/${req.params.id}/end error:`, err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
