import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

const API = "http://localhost:5000/api/settings";

const getUser = () => JSON.parse(localStorage.getItem("user"));

function Settings() {
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [prefs, setPrefs] = useState({
    email_notifications: true,
    due_date_alerts: true,
  });

  const [profileMsg, setProfileMsg] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [prefsMsg, setPrefsMsg] = useState("");

  useEffect(() => {
    const user = getUser();
    if (!user) return;

    axios
      .get(`${API}/profile/${user.id}`)
      .then((res) =>
        setProfile({ name: res.data.name, email: res.data.email })
      )
      .catch(console.error);

    axios
      .get(`${API}/preferences/${user.id}`)
      .then((res) => setPrefs(res.data))
      .catch(console.error);
  }, []);

  const saveProfile = () => {
    const user = getUser();
    axios
      .put(`${API}/profile/${user.id}`, profile)
      .then(() => setProfileMsg("Profile updated successfully."))
      .catch(() => setProfileMsg("Failed to update profile."));
  };

  const savePassword = () => {
    const user = getUser();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg("New passwords do not match.");
      return;
    }
    axios
      .put(`${API}/change-password/${user.id}`, {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      })
      .then(() => {
        setPasswordMsg("Password changed successfully.");
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      })
      .catch((err) => {
        setPasswordMsg(
          err.response?.data?.message || "Failed to change password."
        );
      });
  };

  const savePrefs = () => {
    const user = getUser();
    axios
      .put(`${API}/preferences/${user.id}`, prefs)
      .then(() => setPrefsMsg("Preferences saved."))
      .catch(() => setPrefsMsg("Failed to save preferences."));
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("activeHousehold");
    window.location.href = "/";
};

  return (
    <Layout>
      <div style={styles.page}>
        <h1 style={styles.title}>Settings</h1>

        {/* Profile */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>👤 Profile Settings</h2>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Name</label>
            <input
              style={styles.input}
              value={profile.name}
              onChange={(e) =>
                setProfile({ ...profile, name: e.target.value })
              }
            />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              value={profile.email}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
            />
          </div>
          {profileMsg && <p style={styles.msg}>{profileMsg}</p>}
          <button style={styles.btn} onClick={saveProfile}>
            Save Profile
          </button>
        </div>

        {/* Change Password */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🔒 Change Password</h2>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Current Password</label>
            <input
              style={styles.input}
              type="password"
              value={passwords.currentPassword}
              onChange={(e) =>
                setPasswords({
                  ...passwords,
                  currentPassword: e.target.value,
                })
              }
            />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>New Password</label>
            <input
              style={styles.input}
              type="password"
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords({ ...passwords, newPassword: e.target.value })
              }
            />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Confirm New Password</label>
            <input
              style={styles.input}
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) =>
                setPasswords({
                  ...passwords,
                  confirmPassword: e.target.value,
                })
              }
            />
          </div>
          {passwordMsg && <p style={styles.msg}>{passwordMsg}</p>}
          <button style={styles.btn} onClick={savePassword}>
            Change Password
          </button>
        </div>

        {/* Notification Preferences */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🔔 Notification Preferences</h2>
          <div style={styles.toggleRow}>
            <span style={styles.label}>Email Notifications</span>
            <input
              type="checkbox"
              checked={prefs.email_notifications}
              onChange={(e) =>
                setPrefs({ ...prefs, email_notifications: e.target.checked })
              }
            />
          </div>
          <div style={styles.toggleRow}>
            <span style={styles.label}>Due Date Alerts</span>
            <input
              type="checkbox"
              checked={prefs.due_date_alerts}
              onChange={(e) =>
                setPrefs({ ...prefs, due_date_alerts: e.target.checked })
              }
            />
          </div>
          {prefsMsg && <p style={styles.msg}>{prefsMsg}</p>}
          <button style={styles.btn} onClick={savePrefs}>
            Save Preferences
          </button>
        </div>

        {/* Logout */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🚪 Logout</h2>
          <p style={styles.label}>
            This will clear your session and return you to the login page.
          </p>
          <button
            style={{ ...styles.btn, ...styles.btnDanger }}
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  page: {
    padding: "32px 28px",
    minHeight: "100vh",
    backgroundColor: "#f4f7fc",
    fontFamily: "sans-serif",
    maxWidth: "640px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1e3c72",
    marginBottom: "24px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    border: "0.5px solid #e8eef7",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e3c72",
    marginBottom: "16px",
    marginTop: 0,
  },
  fieldGroup: {
    marginBottom: "14px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    color: "#64748b",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "8px",
    border: "0.5px solid #cbd5e1",
    fontSize: "14px",
    color: "#1e293b",
    boxSizing: "border-box",
    outline: "none",
  },
  toggleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
  },
  btn: {
    marginTop: "8px",
    padding: "9px 20px",
    backgroundColor: "#1e3c72",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
  },
  btnDanger: {
    backgroundColor: "#dc2626",
  },
  msg: {
    fontSize: "13px",
    color: "#0f6e56",
    marginBottom: "8px",
  },
};

export default Settings;