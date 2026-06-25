import Layout from "../components/Layout";
import useNotifications from "../hooks/useNotifications";

function Notifications() {
  const user = JSON.parse(localStorage.getItem("user"));
  const { notifications, loading } = useNotifications(user);

  return (
    <Layout>
      <div style={styles.page}>
        <h1 style={styles.title}>Notifications</h1>
        <p style={styles.subtitle}>
          Bill reminders and invites, all in one place
        </p>

        <div style={styles.card}>
          {loading ? (
            <p style={styles.empty}>Loading...</p>
          ) : notifications.length === 0 ? (
            <p style={styles.empty}>You're all caught up.</p>
          ) : (
            notifications.map((n, i) => (
              <div key={i} style={styles.row}>
                <span style={{ marginRight: "10px" }}>
                  {n.type === "invite" ? "📬" : "🔔"}
                </span>
                <span>{n.text}</span>
              </div>
            ))
          )}
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
  title: { fontSize: "24px", fontWeight: "600", color: "#1e3c72", margin: "0 0 4px" },
  subtitle: { fontSize: "14px", color: "#64748b", margin: "0 0 24px" },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    border: "0.5px solid #e8eef7",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  row: {
    padding: "12px 0",
    borderBottom: "0.5px solid #f1f5f9",
    fontSize: "14px",
    color: "#1e293b",
  },
  empty: { textAlign: "center", padding: "24px", color: "#94a3b8" },
};

export default Notifications;