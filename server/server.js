const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/auth");
const meetingRoutes = require("./routes/meeting");
const tasksRoutes = require("./routes/tasks");
const usersRoutes = require("./routes/users");
const chatRoutes = require("./routes/chats");

const app = express();

app.use(express.json());

// ✅ CORS — FIXED
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (
        origin.includes("vercel.app") ||
        origin === "http://localhost:3000"
      ) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/meeting", meetingRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/chats", chatRoutes);

// DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

// SERVER
const server = http.createServer(app);

// ✅ Socket.IO — SAME CORS LOGIC
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
