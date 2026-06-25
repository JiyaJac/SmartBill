import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { username, password }
      );

      const user = response.data.user;

      localStorage.setItem("user", JSON.stringify(user));

      // set first household as active by default
      if (user.households && user.households.length > 0) {
        localStorage.setItem(
          "activeHousehold",
          JSON.stringify({
            household_id: user.households[0].household_id,
            household_name: user.households[0].household_name,
            role: user.households[0].role,
          })
        );
      }

      navigate("/dashboard");

    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>SmartBill AI</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p style={{ color: "#dc2626", fontSize: "13px", margin: "4px 0" }}>
            {error}
          </p>
        )}

        <button className="login-btn" onClick={handleLogin}>
          Login
        </button>

        <p>
          Don't have an account?{" "}
          <span
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>

        <p>
          Have an invite code?{" "}
          <Link
            to="/join-family"
            style={{ color: "green", textDecoration: "none", fontWeight: "bold" }}
          >
            Join Family
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;