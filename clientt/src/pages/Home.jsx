import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-home">
      <h1>Welcome, Admin</h1>
      <p className="subtitle">Select an option below to manage your platform:</p>

      <div className="features-grid">
        <div className="feature-card" onClick={() => navigate("/meeting")}>
          <h2>📹 Meetings</h2>
          <p>Create or manage live meetings</p>
        </div>

        <div className="feature-card" onClick={() => navigate("/tasks")}>
          <h2>✅ Tasks</h2>
          <p>Add, assign, and track tasks</p>
        </div>

        <div className="feature-card" onClick={() => navigate("/Chat")}>
          <h2>💬 Chat</h2>
          <p>Communicate with users or team</p>
        </div>

        <div className="feature-card" onClick={() => navigate("/Reports")}>
          <h2>📊 Reports</h2>
          <p>View platform statistics and logs</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
