const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const User = require("../models/User");

console.log("Tasks router loaded");

// TEMP AUTH MIDDLEWARE (replace with real JWT auth later)
router.use((req, res, next) => {
  req.user = {
    id: "697f150fec6d7bfbc041330e", // your test user id
    role: "admin", // or "user"
  };
  next();
});

// Middleware: check admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });
  next();
};

// GET all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ assignedAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});


// POST assign a new task (admin only)
// POST assign a new task (admin only)
router.post("/", isAdmin, async (req, res) => {
  try {
    const { title, dueDate, assignedTo } = req.body;

    if (!title || !dueDate || !assignedTo)
      return res.status(400).json({ message: "All fields required" });

    const user = await User.findById(assignedTo);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const newTask = new Task({
      title: title.trim(),
      dueDate,
      assignedTo: user._id,
      assignedToEmail: user.email,
      assignedBy: req.user.id,
    });

    await newTask.save();

    // 🔥 SOCKET EMIT
    const io = req.app.get("io");
    io.emit("task:assigned", newTask);

    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// PUT mark task as completed
router.put("/:id/complete", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.isCompleted = true;
    await task.save();

    // 🔥 SOCKET EMIT
    const io = req.app.get("io");
    io.emit("task:completed", task);

    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// DELETE task (admin only)
router.delete("/:id", isAdmin, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const io = req.app.get("io");
    io.emit("task:deleted", task._id);

    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


module.exports = router;
