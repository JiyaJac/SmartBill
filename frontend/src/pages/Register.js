import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setInviteCode("");
  };

  const handleRegister = async () => {
    setError("");

    if (!form.fullName || !form.email || !form.username || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register-admin",
        {
          household_name: `${form.fullName}'s Family`,
          name: form.fullName,
          email: form.email,
          username: form.username,
          password: form.password,
        }
      );

      localStorage.setItem("inviteCode", response.data.inviteCode);
      setInviteCode(response.data.inviteCode);

    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Registration Failed");
    }
  };

  // show invite code screen after successful registration
  if (inviteCode) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2>🎉 Registered!</h2>
          <p style={{ color: "#555", fontSize: "14px" }}>
            Share this invite code with your family members so they can join.
          </p>
          <div style={styles.inviteBox}>
            <p style={styles.inviteLabel}>Your Invite Code</p>
            <h1 style={styles.inviteCode}>{inviteCode}</h1>
          </div>
          <button
            className="login-btn"
            onClick={() => navigate("/")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Register</h2>

        <input
          name="fullName"
          type="text"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          name="username"
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />

        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
        />

        {error && (
          <p style={{ color: "#dc2626", fontSize: "13px", margin: "4px 0" }}>
            {error}
          </p>
        )}

        <button className="login-btn" onClick={handleRegister}>
          Register
        </button>

        <p style={{ marginTop: "15px" }}>
          Already have an account?{" "}
          <span
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  inviteBox: {
    backgroundColor: "#f4f7fc",
    borderRadius: "12px",
    padding: "20px",
    margin: "16px 0",
    border: "0.5px solid #e8eef7",
  },
  inviteLabel: {
    fontSize: "12px",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: "0 0 8px",
  },
  inviteCode: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1e3c72",
    letterSpacing: "0.15em",
    margin: 0,
  },
};

export default Register;