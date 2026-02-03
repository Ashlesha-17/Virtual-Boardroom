import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import socket from "../socket";
import "./Chat.css";

const BACKEND_URL = "http://localhost:5000";

const Chat = ({ user : propUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const messagesEndRef = useRef(null);
  const user = propUser || JSON.parse(localStorage.getItem("user")) || { name: "Unknown", email: "" };

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/chats`);
        // sort by createdAt just in case
        const sorted = res.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setMessages(sorted);
      } catch (err) {
        console.error("Fetch chat error:", err);
      }
    };
    fetchMessages();
  }, []);

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = (msg) => {
      setMessages(prev => [...prev, msg]);
    };
    socket.on("chat:new", handleNewMessage);
    return () => socket.off("chat:new", handleNewMessage);
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
const sendMessage = async () => {
  if (!newMsg.trim()) return;

  const msgData = {
    message: newMsg.trim(),
    senderName: user.name,
    senderEmail: user.email
  };

  try {
    await axios.post(`${BACKEND_URL}/api/chats`, msgData); // backend emits via socket
    setNewMsg(""); // clear input
    // ❌ no need to add manually or emit via socket
  } catch (err) {
    console.error("Send message error:", err);
  }
};


  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map(msg => {
          const isOwn = msg.senderEmail === user.email;
          return (
            <div
              key={msg._id || Math.random()}
              className={`chat-message ${isOwn ? "own-message" : "other-message"}`}
            >
              {!isOwn && <div className="chat-sender-name">{msg.senderName || "Unknown"}</div>}
              <div className="chat-text">{msg.message}</div>
              <div className="chat-time">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
