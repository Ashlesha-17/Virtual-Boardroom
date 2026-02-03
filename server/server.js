const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

// ROUTES
const authRoutes = require("./routes/auth");
const meetingRoutes = require("./routes/meeting");
const tasksRoutes = require("./routes/tasks");
const usersRoutes = require("./routes/users");
const chatRoutes = require("./routes/chats");

const app = express();

const allowedOrigins = [
  "https://virtual-boardroom.vercel.app",
  "https://virtual-boardroom-ox14.vercel.app",
  "https://virtual-boardroom-vfhc.vercel.app",
  "https://virtual-boardroom-ox14-2qfqy85j7-ashlesha-mandhares-projects.vercel.app",
  "http://localhost:3000"
];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true); // allow Postman or server requests
    if(allowedOrigins.includes(origin)){
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/meeting", meetingRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/chats", chatRoutes);

// CONNECT MONGODB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// CREATE SERVER & SOCKET.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

// Make io accessible in routes
app.set("io", io);

// SOCKET CONNECTION
io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});


// START SERVER
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
