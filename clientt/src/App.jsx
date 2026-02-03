import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/signup";
import Meeting from "./pages/Meeting";
import UserDashboard from "./pages/User";
import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import Chat from "./pages/Chat";
import Reports from "./pages/Reports";

// ProtectedRoute: checks if user is logged in
const ProtectedRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// RoleProtectedRoute: checks user role
const RoleProtectedRoute = ({ user, role, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (user.role?.toLowerCase() !== role.toLowerCase()) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  // Initialize user from localStorage once
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup />} />

        {/* Home - general landing page after login */}
        <Route
          path="/home"
          element={
            <ProtectedRoute user={user}>
              <Home user={user} />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/meeting"
          element={
            <RoleProtectedRoute user={user} role="admin">
              <Meeting user={user} />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <RoleProtectedRoute user={user} role="admin">
              <Reports user={user} />
            </RoleProtectedRoute>
          }
        />

        {/* User Routes */}
        <Route
          path="/user"
          element={
            <RoleProtectedRoute user={user} role="user">
              <UserDashboard user={user} />
            </RoleProtectedRoute>
          }
        />

        {/* Common Routes (accessible by all logged-in users) */}
        <Route
          path="/tasks"
          element={
            <ProtectedRoute user={user}>
              <Tasks user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute user={user}>
              <Chat user={user} />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
