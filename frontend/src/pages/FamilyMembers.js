import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

function FamilyMembers() {
  const [members, setMembers] = useState([]);
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteMsg, setInviteMsg] = useState({ text: "", success: true });
  const [pendingInvites, setPendingInvites] = useState([]);
  const [leaveMsg, setLeaveMsg] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const activeHousehold = JSON.parse(localStorage.getItem("activeHousehold"));

  useEffect(() => {
    if (!activeHousehold?.household_id) return;

    axios
      .get(`http://localhost:5000/api/auth/family-members/${activeHousehold.household_id}`)
      .then((res) => setMembers(res.data))
      .catch((err) => console.error("Error fetching family members:", err));

    if (user?.username) {
      axios
        .get(`http://localhost:5000/api/invites/pending/${user.username}`)
        .then((res) => setPendingInvites(res.data.filter((i) => i.status === "pending")))
        .catch((err) => console.error("Error fetching invites:", err));
    }
  }, [activeHousehold?.household_id, user.username]);

  const canLeave = !(
    activeHousehold?.household_id === user?.household_id &&
    user?.role === "admin"
  );

  const leaveFamily = () => {
    if (!window.confirm(`Leave ${activeHousehold?.household_name}?`)) return;

    axios
      .post("http://localhost:5000/api/auth/leave-family", {
        user_id: user.id,
        household_id: activeHousehold.household_id,
      })
      .then(() => {
        localStorage.removeItem("activeHousehold");
        window.location.href = "/dashboard";
      })
      .catch((err) => {
        setLeaveMsg(err.response?.data?.message || "Failed to leave household.");
      });
  };

  const sendInvite = () => {
    setInviteMsg({ text: "", success: true });

    if (!inviteUsername.trim()) {
      setInviteMsg({ text: "Please enter a username.", success: false });
      return;
    }

    axios
      .post("http://localhost:5000/api/invites/send", {
        from_user_id: user.id,
        to_username: inviteUsername.trim(),
        household_id: activeHousehold.household_id,
        invite_code: activeHousehold.invite_code,
      })
      .then(() => {
        setInviteMsg({ text: "Invite sent successfully!", success: true });
        setInviteUsername("");
      })
      .catch((err) => {
        setInviteMsg({
          text: err.response?.data?.message || "Failed to send invite.",
          success: false,
        });
      });
  };

  const acceptInvite = (inviteId) => {
    axios
      .post(`http://localhost:5000/api/invites/accept/${inviteId}`)
      .then((res) => {
        setPendingInvites((prev) => prev.filter((i) => i.id !== inviteId));

        const newHousehold = res.data.household;
        if (newHousehold) {
          const currentUser = JSON.parse(localStorage.getItem("user"));
          const alreadyInList = currentUser.households?.some(
            (h) => h.household_id === newHousehold.household_id
          );

          const updatedUser = {
            ...currentUser,
            households: alreadyInList
              ? currentUser.households
              : [...(currentUser.households || []), newHousehold],
          };

          localStorage.setItem("user", JSON.stringify(updatedUser));

          // jump straight into the newly joined household
          localStorage.setItem("activeHousehold", JSON.stringify(newHousehold));
          window.location.reload();
        }
      })
      .catch((err) => console.error("Error accepting invite:", err));
  };

  const declineInvite = (inviteId) => {
    axios
      .post(`http://localhost:5000/api/invites/decline/${inviteId}`)
      .then(() => {
        setPendingInvites((prev) => prev.filter((i) => i.id !== inviteId));
      })
      .catch((err) => console.error("Error declining invite:", err));
  };

  const getRoleStyle = (role) => {
    if (role === "admin") return { ...styles.badge, ...styles.badgeAdmin };
    return { ...styles.badge, ...styles.badgeMember };
  };

  return (
    <Layout>
      <div style={styles.page}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Family Members</h1>
            <p style={styles.subtitle}>
              {members.length} member{members.length !== 1 ? "s" : ""} in this household
            </p>
          </div>
          <div>
            {canLeave && (
              <button style={styles.declineBtn} onClick={leaveFamily}>
                Leave Family
              </button>
            )}
            {leaveMsg && <p style={styles.msgError}>{leaveMsg}</p>}
          </div>
        </div>

        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📬 Pending Invites</h2>
            {pendingInvites.map((invite) => (
              <div key={invite.id} style={styles.inviteRow}>
                <div>
                  <p style={styles.inviteName}>
                    {invite.from_name} invited you to{" "}
                    <strong>{invite.household_name}</strong>
                  </p>
                  <p style={styles.inviteDate}>
                    {new Date(invite.created_at).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div style={styles.inviteActions}>
                  <button
                    style={styles.acceptBtn}
                    onClick={() => acceptInvite(invite.id)}
                  >
                    Accept
                  </button>
                  <button
                    style={styles.declineBtn}
                    onClick={() => declineInvite(invite.id)}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Send Invite */}
        {activeHousehold?.role === "admin" && (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>➕ Invite a Member</h2>
            <p style={styles.cardSubtitle}>
              Enter the username of the person you want to invite to{" "}
              <strong>{activeHousehold?.household_name}</strong>
            </p>
            <div style={styles.inviteForm}>
              <input
                style={styles.input}
                placeholder="Enter username"
                value={inviteUsername}
                onChange={(e) => {
                  setInviteUsername(e.target.value);
                  setInviteMsg({ text: "", success: true });
                }}
              />
              <button style={styles.btn} onClick={sendInvite}>
                Send Invite
              </button>
            </div>
            {inviteMsg.text && (
              <p style={inviteMsg.success ? styles.msgSuccess : styles.msgError}>
                {inviteMsg.text}
              </p>
            )}
          </div>
        )}

        {/* Members Table */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Members</h2>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Username</th>
                <th style={styles.th}>Role</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan="3" style={styles.empty}>
                    No family members found
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id}>
                    <td style={styles.td}>
                      <div style={styles.nameRow}>
                        <div style={styles.avatar}>
                          {member.name?.charAt(0).toUpperCase()}
                        </div>
                        {member.name}
                      </div>
                    </td>
                    <td style={styles.td}>@{member.username}</td>
                    <td style={styles.td}>
                      <span style={getRoleStyle(member.role)}>
                        {member.role}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1e3c72",
    margin: "0 0 4px",
  },
  subtitle: { fontSize: "14px", color: "#64748b", margin: 0 },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "20px",
    border: "0.5px solid #e8eef7",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 4px",
  },
  cardSubtitle: { fontSize: "13px", color: "#94a3b8", margin: "0 0 16px" },
  inviteRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "0.5px solid #f1f5f9",
    flexWrap: "wrap",
    gap: "12px",
  },
  inviteName: { fontSize: "14px", color: "#1e293b", margin: "0 0 4px" },
  inviteDate: { fontSize: "12px", color: "#94a3b8", margin: 0 },
  inviteActions: { display: "flex", gap: "8px" },
  acceptBtn: {
    padding: "7px 16px",
    backgroundColor: "#0f6e56",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    cursor: "pointer",
  },
  declineBtn: {
    padding: "7px 16px",
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    cursor: "pointer",
  },
  inviteForm: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  input: {
    flex: 1,
    padding: "9px 12px",
    borderRadius: "8px",
    border: "0.5px solid #cbd5e1",
    fontSize: "14px",
    outline: "none",
    minWidth: "200px",
  },
  btn: {
    padding: "9px 20px",
    backgroundColor: "#1e3c72",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
  },
  msgSuccess: { fontSize: "13px", color: "#0f6e56", marginTop: "8px" },
  msgError: { fontSize: "13px", color: "#dc2626", marginTop: "8px" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "14px" },
  th: {
    textAlign: "left",
    padding: "12px 16px",
    backgroundColor: "#f4f7fc",
    color: "#64748b",
    fontWeight: "500",
    borderBottom: "0.5px solid #e2e8f0",
  },
  td: {
    padding: "14px 16px",
    borderBottom: "0.5px solid #f1f5f9",
    color: "#1e293b",
  },
  empty: {
    textAlign: "center",
    padding: "30px",
    color: "#94a3b8",
    fontSize: "14px",
  },
  nameRow: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#e8eef7",
    color: "#1e3c72",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    fontSize: "13px",
  },
  badge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "500",
    textTransform: "capitalize",
  },
  badgeAdmin: { backgroundColor: "#e8eef7", color: "#1e3c72" },
  badgeMember: { backgroundColor: "#e1f5ee", color: "#0f6e56" },
};

export default FamilyMembers;