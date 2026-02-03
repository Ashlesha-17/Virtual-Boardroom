import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Reports.css";

// 🔹 Use environment variable for backend
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Reports = () => {
  const [meetings, setMeetings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [meetRes, taskRes, chatRes, userRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/meeting`),
          axios.get(`${BACKEND_URL}/api/tasks`),
          axios.get(`${BACKEND_URL}/api/chats`),
          axios.get(`${BACKEND_URL}/api/users`)
        ]);

        setMeetings(meetRes.data);
        setTasks(taskRes.data);
        setChats(chatRes.data);
        setUsers(userRes.data);
      } catch (err) {
        console.error("Fetch reports error:", err);
      }
    };

    fetchReports();
  }, []);

  // Computed stats
  const liveMeetings = meetings.filter(m => m.isLive).length;
  const endedMeetings = meetings.length - liveMeetings;
  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const pendingTasks = tasks.length - completedTasks;

  return (
    <div className="reports-dashboard">
      <h2>Admin Reports</h2>

      <div className="reports-grid">
        {/* Meetings */}
        <div className="report-card">
          <h3>📹 Meetings</h3>
          <p>Total: {meetings.length}</p>
          <p>Live: {liveMeetings}</p>
          <p>Ended: {endedMeetings}</p>
        </div>

        {/* Tasks */}
        <div className="report-card">
          <h3>✅ Tasks</h3>
          <p>Total: {tasks.length}</p>
          <p>Completed: {completedTasks}</p>
          <p>Pending: {pendingTasks}</p>
        </div>

        {/* Chats */}
        <div className="report-card">
          <h3>💬 Chats</h3>
          <p>Total Messages: {chats.length}</p>
        </div>

        {/* Users */}
        <div className="report-card">
          <h3>👥 Users</h3>
          <p>Total Users: {users.length}</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
