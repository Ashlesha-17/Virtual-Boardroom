// server/seedConfigs.js
const mongoose = require("mongoose");
const Config = require("./models/Config");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

const configs = [
  { key: "theme", value: "light" },
  { key: "notifications", value: "enabled" },
  { key: "language", value: "english" }
];

Config.insertMany(configs)
  .then(() => {
    console.log("Configs added!");
    mongoose.disconnect();
  })
  .catch(err => console.log(err));
