import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import "./Dashboard.css";

// ⚡ Backend URL
const BACKEND_URL = "http://localhost:5000";

// ⚠️ Create socket ONCE
const socket = io(BACKEND_URL, { autoConnect: true });

const Meeting = () => {
  const [title, setTitle] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch meetings once on load
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/meeting`);
        setMeetings(res.data);
      } catch (err) {
        console.error("Fetch meetings error:", err);
        alert("Failed to fetch meetings. Is your backend running?");
      }
    };
    fetchMeetings();
  }, []);

  // Socket listeners (REAL-TIME updates only)
  useEffect(() => {
    const onMeetingStart = (meeting) => {
      setMeetings(prev => {
        if (prev.some(m => m._id === meeting._id)) return prev;
        return [meeting, ...prev];
      });
    };

    const onMeetingEnd = (meeting) => {
      setMeetings(prev =>
        prev.map(m =>
          m._id === meeting._id ? { ...m, isLive: false } : m
        )
      );
    };

    socket.on("meeting:start", onMeetingStart);
    socket.on("meeting:end", onMeetingEnd);

    return () => {
      socket.off("meeting:start", onMeetingStart);
      socket.off("meeting:end", onMeetingEnd);
    };
  }, []);

  // Start meeting
  const startMeeting = async () => {
    const trimmedTitle = title.trim();
    const trimmedLink = meetingLink.trim();

    if (!trimmedTitle || !trimmedLink) {
      return alert("Please enter both title and meet link");
    }

    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/meeting`, {
        title: trimmedTitle,
        meetLink: trimmedLink,
      });

      setTitle("");
      setMeetingLink("");
    } catch (err) {
      console.error("Start meeting error:", err);
      alert(err.response?.data?.message || "Failed to start meeting");
    } finally {
      setLoading(false);
    }
  };

  // End meeting
  const endMeeting = async (id) => {
    try {
      await axios.put(`${BACKEND_URL}/api/meeting/${id}/end`);
      // UI will update via socket
    } catch (err) {
      console.error("End meeting error:", err);
      alert("Failed to end meeting");
    }
  };

  return (
    <div className="dashboard1">
      <h2>Boardroom</h2>

      <div className="card">
        <h3>Start New Meeting</h3>
        <input
          type="text"
          placeholder="Meeting Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Paste Meeting link"
          value={meetingLink}
          onChange={e => setMeetingLink(e.target.value)}
        />
        <button onClick={startMeeting} disabled={loading}>
          {loading ? "Starting..." : "Start Meeting"}
        </button>
      </div>

      <div className="card">
        <h3>Meetings</h3>
        {meetings.length === 0 ? (
          <p>No meetings yet</p>
        ) : (
          meetings.map(m => (
            <div
              key={m._id}
              style={{
                background: m.isLive ? "#4caf50" : "#555",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "6px",
                color: "white",
              }}
            >
              <strong>{m.title}</strong><br />
              <a
                href={m.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#ffeb3b" }}
              >
                Join Link
              </a>
              <br />
              {m.isLive ? (
                <button
                  style={{ marginTop: "5px" }}
                  onClick={() => endMeeting(m._id)}
                >
                  End Meeting
                </button>
              ) : (
                <span style={{ marginTop: "5px" }}>Ended</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Meeting;
