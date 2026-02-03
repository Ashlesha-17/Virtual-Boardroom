import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./auth.css";

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🔹 Use environment variable for backend URL
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL?.trim();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 🔹 Debug: check backend URL
    if (!BACKEND_URL) {
      alert("Backend URL not set. Check REACT_APP_BACKEND_URL in Vercel.");
      setLoading(false);
      return;
    }

    try {
      // 🔹 Log request for debugging
      console.log("Logging in with:", { email, password });

      const res = await axios.post(
        `${BACKEND_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true } // 🔹 ensures cookies work if backend sets them
      );

      const loggedUser = res.data.user;

      // ✅ Store user in localStorage & update state
      localStorage.setItem("user", JSON.stringify(loggedUser));
      setUser(loggedUser);

      // ✅ Redirect based on role
      if (loggedUser.role?.toLowerCase() === "admin") {
        navigate("/home");
      } else {
        navigate("/user");
      }
    } catch (err) {
      console.error("Login error:", err.response || err);
      alert(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Login</h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p>
          Don’t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
