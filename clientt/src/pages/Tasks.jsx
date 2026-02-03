import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Tasks.css";

const BACKEND_URL = "http://localhost:5000";

const Tasks = ({ user }) => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState(""); // user id
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch all tasks
  const fetchTasks = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${BACKEND_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      console.error("Fetch tasks error:", err);
    }
  };

  // ✅ Fetch all normal users for dropdown
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/users`);
      console.log("All users from backend:", res.data);
      setUsers(res.data); // remove filter
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  // ✅ Assign task
  const assignTask = async () => {
    if (!title.trim() || !dueDate || !assignedTo) return alert("Fill all fields");
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${BACKEND_URL}/api/tasks`,
        { title, dueDate, assignedTo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle("");
      setDueDate("");
      setAssignedTo("");
      fetchTasks();
    } catch (err) {
      console.error("Assign task error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Complete task
  const completeTask = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `${BACKEND_URL}/api/tasks/${id}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTasks();
    } catch (err) {
      console.error("Complete task error:", err);
    }
  };

  // ✅ Delete task
  const deleteTask = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${BACKEND_URL}/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (err) {
      console.error("Delete task error:", err);
    }
  };

  return (
    <div className="tasks-page">
      <h1>Task Manager</h1>

      {/* ✅ Task assignment form (always visible for admins) */}
      {user && (
        <div className="task-form">
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
            <option value="">Assign to user</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.email} {/* Shows only email */}
              </option>
            ))}
          </select>
          <button onClick={assignTask} disabled={loading}>
            {loading ? "Assigning..." : "Assign Task"}
          </button>
        </div>
      )}

      <h2>Tasks</h2>
      {tasks.length === 0 ? (
        <p>No tasks yet</p>
      ) : (
        tasks.map((task) => {
          const assignedUser = users.find((u) => u._id === task.assignedTo);
          return (
            <div
              key={task._id}
              className={`task-item ${task.isCompleted ? "completed" : ""}`}
            >
              <div>
                <strong>{task.title}</strong> — Due:{" "}
                {new Date(task.dueDate).toLocaleDateString()}
                <br />
                {assignedUser ? (
                  <span>Assigned to: {assignedUser.email}</span>
                ) : (
                  <span>Assigned to: Unknown</span>
                )}
              </div>
              <div>
                {!task.isCompleted && (
                  <button onClick={() => completeTask(task._id)}>Complete</button>
                )}
                {user && <button onClick={() => deleteTask(task._id)}>Delete</button>}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Tasks;
