import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function JoinFamily() {
  const [form, setForm] = useState({
    invite_code: "",
    username: "",
    password: "",
    name: "",
    email: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/join-family",
        form
      );

      const existingUser = JSON.parse(localStorage.getItem("user")) || {};

      const updatedUser = {
        ...existingUser,
        ...res.data.user,
        households: [
          ...(existingUser.households || []),
          {
            household_id: res.data.user.household_id,
            household_name: res.data.household_name || "Family",
            role: "member",
          },
        ],
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      // set active household to the one just joined
      localStorage.setItem(
        "activeHousehold",
        JSON.stringify({
          household_id: res.data.user.household_id,
          household_name: res.data.household_name || "Family",
          role: "member",
        })
      );

      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to join family");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🏠 Join Your Family</h2>
        <p style={styles.subtitle}>
          Enter invite code to access shared bills & data
        </p>

        <div style={styles.form}>
          <input
            name="invite_code"
            placeholder="Invite Code"
            onChange={handleChange}
            style={styles.input}
          />
          <input
            name="name"
            placeholder="Full Name (new users only)"
            onChange={handleChange}
            style={styles.input}
          />
          <input
            name="email"
            placeholder="Email (new users only)"
            onChange={handleChange}
            style={styles.input}
          />
          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            style={styles.input}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            style={styles.input}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button onClick={handleSubmit} style={styles.button}>
            Join Family
          </button>

          <p style={styles.footerText}>
            Already have an account?{" "}
            <span style={styles.link} onClick={() => navigate("/")}>
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #490cba, #031669)",
  },
  card: {
    width: "360px",
    padding: "30px",
    borderRadius: "15px",
    backgroundColor: "#fff",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  title: { marginBottom: "5px" },
  subtitle: {
    fontSize: "13px",
    color: "#666",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #03415e",
    outline: "none",
    fontSize: "14px",
  },
  button: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#4A90E2",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
  },
  error: {
    color: "#dc2626",
    fontSize: "13px",
    margin: 0,
  },
  footerText: {
    fontSize: "12px",
    marginTop: "10px",
  },
  link: {
    color: "#4A90E2",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default JoinFamily;