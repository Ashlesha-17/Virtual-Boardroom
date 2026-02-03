import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import "./User.css";

const BACKEND_URL = "http://localhost:5000";
const socket = io(BACKEND_URL);

const UserDashboard = () => {
  const [meetings, setMeetings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.email;

  /* ===================== FETCH MEETINGS ===================== */
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/meeting`);
        setMeetings(res.data);
      } catch (err) {
        console.error("Fetch meetings error:", err);
      }
    };
    fetchMeetings();
  }, []);

  /* ===================== FETCH TASKS ===================== */
  useEffect(() => {
    const fetchTasks = async () => {
      if (!userEmail) return;
      try {
        const res = await axios.get(`${BACKEND_URL}/api/tasks?email=${userEmail}`);
        setTasks(res.data.sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt)));
      } catch (err) {
        console.error("Fetch tasks error:", err);
      }
    };
    fetchTasks();
  }, [userEmail]);

  /* ===================== FETCH CHAT ===================== */
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/chats`);
        setChatMessages(res.data);
      } catch (err) {
        console.error("Fetch chats error:", err);
      }
    };
    fetchChats();
  }, []);

  /* ===================== SOCKET EVENTS ===================== */
  useEffect(() => {
    socket.on("meeting:start", meeting => setMeetings(prev => [meeting, ...prev]));
    socket.on("meeting:end", meeting =>
      setMeetings(prev => prev.map(m => (m._id === meeting._id ? { ...m, isLive: false } : m)))
    );

    socket.on("task:assigned", task => {
      if (task.assignedToEmail === userEmail) setTasks(prev => [task, ...prev]);
    });
    socket.on("task:completed", task => {
      setTasks(prev => prev.map(t => (t._id === task._id ? task : t)));
    });

    socket.on("chat:new", msg => {
      setChatMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off("meeting:start");
      socket.off("meeting:end");
      socket.off("task:assigned");
      socket.off("task:completed");
      socket.off("chat:new");
    };
  }, [userEmail]);

  /* ===================== SEND CHAT ===================== */
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await axios.post(`${BACKEND_URL}/api/chats`, {
        message: newMessage,
        senderName: user.name,
        senderEmail: user.email,
      });

      // Emit to socket immediately
      socket.emit("chat:new", res.data);

      setNewMessage("");
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  /* ===================== AUTO SCROLL ===================== */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  return (
    <div className="dashboard">
      <h2>User Dashboard</h2>

      {/* ================= LIVE MEETINGS ================= */}
      <div className="card">
        <h3>Live Meetings</h3>
        {meetings.filter(m => m.isLive).length === 0 && <p>No live meetings</p>}
        {meetings.filter(m => m.isLive).map(m => (
          <div
            key={m._id}
            style={{
              background: "#4caf50",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "6px",
              color: "white"
            }}
          >
            <strong>{m.title}</strong><br />
            <a href={m.meetLink} target="_blank" rel="noopener noreferrer" style={{ color: "#ffeb3b" }}>
              Join Meeting
            </a>
          </div>
        ))}
      </div>

      {/* ================= TASKS ================= */}
{/* ================= TASKS ================= */}
<div className="card">
  <h3>Your Tasks</h3>
  {tasks.filter(task => task.assignedToEmail === userEmail).length === 0 && (
    <p>No tasks assigned</p>
  )}
  {tasks
    .filter(task => task.assignedToEmail === userEmail)
    .map(task => (
      <div
        key={task._id}
        style={{
          border: "1px solid #ddd",
          padding: "10px",
          marginBottom: "10px",
          borderRadius: "6px"
        }}
      >
        <strong>{task.title}</strong>
        <p>📅 Due: {new Date(task.dueDate).toLocaleDateString()}</p>
        <p>⏰ Assigned: {new Date(task.assignedAt).toLocaleString()}</p>
        {task.isCompleted ? (
          <span style={{ color: "green", fontWeight: "bold" }}>
            ✅ Completed {task.approvedByAdmin && "(Approved)"}
          </span>
        ) : (
          <span style={{ color: "#ff9800", fontWeight: "bold" }}>⏳ Pending</span>
        )}
      </div>
    ))}
</div>


      {/* ================= GLOBAL CHAT ================= */}
      <div className="card chat-card">
        <h3>Global Chat</h3>
        <div className="chat-box">
          {chatMessages.map(msg => {
            const isOwn = msg.senderEmail === user.email;
            return (
              <div
                key={msg._id}
                className={`chat-message ${isOwn ? "own-message" : "other-message"}`}
              >
                {/* Only show sender name if not your own message */}
                {!isOwn && <div className="chat-sender-name">{msg.senderName || "Unknown"}</div>}

                <div className="chat-text">{msg.message}</div>

                <div className="chat-time">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
