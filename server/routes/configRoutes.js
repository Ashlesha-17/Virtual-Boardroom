const express = require("express");
const router = express.Router();
const Config = require("../models/Config");

// GET all configs
router.get("/", async (req, res) => {
  try {
    const configs = await Config.find();
    res.json(configs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new config
router.post("/", async (req, res) => {
  try {
    const { key, value } = req.body;

    const newConfig = new Config({ key, value });
    await newConfig.save();

    res.status(201).json(newConfig);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update config  ✅ FIXED
router.put("/:id", async (req, res) => {
  try {
    const { value } = req.body;

    const config = await Config.findById(req.params.id);
    if (!config) {
      return res.status(404).json({ message: "Config not found!" });
    }

    config.value = value;
    config.updatedAt = Date.now();
    await config.save();

    const io = req.app.get("io");
    io.emit("config:update",{
        key : config.key,
        value : config.value,
    });

    res.json(config);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE config  ✅ FIXED
router.delete("/:id", async (req, res) => {
  try {
    const config = await Config.findByIdAndDelete(req.params.id);
    if (!config) {
      return res.status(404).json({ message: "Config not found!" });
    }

    res.json({ message: "Config deleted!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
