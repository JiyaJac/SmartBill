import Layout from "../components/Layout";
import HouseholdSwitcher from "../components/HouseholdSwitcher";
import { useEffect, useState } from "react";
import axios from "axios";
import useNotifications from "../hooks/useNotifications";


function Dashboard() {
  const [inviteCode, setInviteCode] = useState("");
  const [familyStats, setFamilyStats] = useState({
    totalExpenses: 0,
    paidBills: 0,
    pendingBills: 0,
    thisMonth: 0,
  });
  const [personalStats, setPersonalStats] = useState({
    thisMonth: 0,
    total: 0,
  });
  const [recentFamilyBills, setRecentFamilyBills] = useState([]);
  const [recentPersonalBills, setRecentPersonalBills] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const activeHousehold = JSON.parse(localStorage.getItem("activeHousehold"));
  const { notifications } = useNotifications(user);

  useEffect(() => {
    if (!user) return;

    // personal bills
    axios
      .get(`http://localhost:5000/api/bills/personal/${user.id}`)
      .then((res) => {
        const bills = res.data;
        const today = new Date();
        const thisMonthTotal = bills
          .filter((b) => {
            const d = new Date(b.due_date);
            return (
              d.getMonth() === today.getMonth() &&
              d.getFullYear() === today.getFullYear()
            );
          })
          .reduce((sum, b) => sum + parseFloat(b.amount), 0);

        const total = bills.reduce(
          (sum, b) => sum + parseFloat(b.amount),
          0
        );

        setPersonalStats({ thisMonth: thisMonthTotal, total });
        setRecentPersonalBills(bills.slice(0, 5));
      })
      .catch((err) => console.error("Error fetching personal bills:", err));

    if (!activeHousehold?.household_id) return;

    const hid = activeHousehold.household_id;

    axios
      .get(`http://localhost:5000/api/auth/household/${hid}`)
      .then((res) => setInviteCode(res.data.invite_code))
      .catch((err) => console.error("Error fetching invite code:", err));

    axios
      .get(`http://localhost:5000/api/reports/stats/${hid}`)
      .then((res) =>
        setFamilyStats({
          totalExpenses: parseFloat(res.data.totalExpenses) || 0,
          paidBills: parseInt(res.data.paidBills) || 0,
          pendingBills: parseInt(res.data.pendingBills) || 0,
          thisMonth: parseFloat(res.data.thisMonth) || 0,
        })
      )
      .catch((err) => console.error("Error fetching stats:", err));

    axios
      .get(`http://localhost:5000/api/bills/household/${hid}`)
      .then((res) => setRecentFamilyBills(res.data.slice(0, 5)))
      .catch((err) => console.error("Error fetching bills:", err));

  }, [activeHousehold?.household_id,user.id]);

  const goTo = (path) => {
    window.location.href = path;
  };

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === "paid") return { color: "#0f6e56", fontWeight: "500" };
    if (s === "overdue") return { color: "#dc2626", fontWeight: "500" };
    return { color: "#854f0b", fontWeight: "500" };
  };

  const renderTable = (bills, showAddedBy = false) => (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Title</th>
          <th style={styles.th}>Amount</th>
          <th style={styles.th}>Due Date</th>
          <th style={styles.th}>Status</th>
          {showAddedBy && <th style={styles.th}>Added By</th>}
        </tr>
      </thead>
      <tbody>
        {bills.map((bill) => {
          const today = new Date();
          const due = new Date(bill.due_date);
          const status =
            bill.status?.toLowerCase() !== "paid" && due < today
              ? "Overdue"
              : bill.status || "Pending";
          return (
            <tr key={bill.id}>
              <td style={styles.td}>{bill.title}</td>
              <td style={styles.td}>
                ₹{parseFloat(bill.amount).toLocaleString("en-IN")}
              </td>
              <td style={styles.td}>
                {new Date(bill.due_date).toLocaleDateString("en-IN")}
              </td>
              <td style={{ ...styles.td, ...getStatusStyle(status) }}>
                {status}
              </td>
              {showAddedBy && (
                <td style={styles.td}>{bill.added_by || "—"}</td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <Layout>
      <div style={styles.page}>

        {/* Header */}
        <div style={styles.topHeader}>
          <div>
            <h1 style={styles.title}>SmartBill AI Dashboard</h1>
            <p style={styles.subtitle}>
              Welcome back, {user?.name} —{" "}
              <span style={{ color: "#1e3c72", fontWeight: "500" }}>
                {activeHousehold?.household_name || "No household selected"}
              </span>
            </p>
          </div>
          <div style={styles.badge}>
            <span style={styles.badgeLabel}>Invite Code</span>
            <strong style={styles.badgeValue}>
              {inviteCode || "Not Available"}
            </strong>
          </div>
        </div>

        <HouseholdSwitcher />

        {/* Personal Stats */}
        <p style={styles.sectionLabel}>My Spending</p>
        <div style={styles.cardGrid}>
          <div style={{ ...styles.card, background: "#faeeda" }}>
            <p style={{ ...styles.cardLabel, color: "#854f0b" }}>
              This Month (Personal)
            </p>
            <h2 style={{ ...styles.cardValue, color: "#854f0b" }}>
              ₹{personalStats.thisMonth.toLocaleString("en-IN")}
            </h2>
          </div>
          <div style={{ ...styles.card, background: "#e8eef7" }}>
            <p style={{ ...styles.cardLabel, color: "#1e3c72" }}>
              Total Personal Expenses
            </p>
            <h2 style={{ ...styles.cardValue, color: "#1e3c72" }}>
              ₹{personalStats.total.toLocaleString("en-IN")}
            </h2>
          </div>
        </div>

        {/* Family Stats */}
        <p style={styles.sectionLabel}>
          {activeHousehold?.household_name || "Family"} Spending
        </p>
        <div style={styles.cardGrid}>
          <div style={styles.card}>
            <p style={styles.cardLabel}>This Month (Family)</p>
            <h2 style={styles.cardValue}>
              ₹{familyStats.thisMonth.toLocaleString("en-IN")}
            </h2>
          </div>
          <div style={styles.card}>
            <p style={styles.cardLabel}>Total Expenses</p>
            <h2 style={styles.cardValue}>
              ₹{familyStats.totalExpenses.toLocaleString("en-IN")}
            </h2>
          </div>
          <div style={styles.card}>
            <p style={styles.cardLabel}>Pending Bills</p>
            <h2 style={{ ...styles.cardValue, color: "#854f0b" }}>
              {familyStats.pendingBills}
            </h2>
          </div>
          <div style={styles.card}>
            <p style={styles.cardLabel}>Paid Bills</p>
            <h2 style={{ ...styles.cardValue, color: "#0f6e56" }}>
              {familyStats.paidBills}
            </h2>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.buttonRow}>
          <button onClick={() => goTo("/bills")} style={styles.btn}>
            View Bills
          </button>
          <button onClick={() => goTo("/upload-bill")} style={styles.btn}>
            Add Bill
          </button>
          <button onClick={() => goTo("/family-members")} style={styles.btn}>
            Family
          </button>
        </div>

        <div style={styles.panel}>
          <h2>Notifications</h2>
          {notifications.length === 0 ? (
            <p style={{ color: "#94a3b8" }}>You're all caught up.</p>
          ) : (
            notifications.slice(0, 5).map((n, i) => (
              <p key={i} style={{ color: n.type === "invite" ? "#1e3c72" : "#333" }}>
                {n.type === "invite" ? "📬" : "🔔"} {n.text}
              </p>
            ))
          )}
        </div>

        {/* Recent Personal Bills */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Recent Personal Bills</h2>
          {recentPersonalBills.length === 0 ? (
            <p style={styles.empty}>No personal bills yet.</p>
          ) : (
            renderTable(recentPersonalBills, false)
          )}
        </div>

        {/* Recent Family Bills */}
        <div style={{ ...styles.panel, marginTop: "20px" }}>
          <h2 style={styles.panelTitle}>Recent Family Bills</h2>
          {recentFamilyBills.length === 0 ? (
            <p style={styles.empty}>No family bills yet.</p>
          ) : (
            renderTable(recentFamilyBills, true)
          )}
        </div>

      </div>
    </Layout>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f4f7fc",
    padding: "32px 28px",
    fontFamily: "sans-serif",
  },
  topHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    marginBottom: "20px",
    gap: "16px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1e3c72",
    margin: "0 0 6px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },
  badge: {
    background: "white",
    padding: "14px 20px",
    borderRadius: "12px",
    border: "0.5px solid #e8eef7",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  badgeLabel: {
    fontSize: "11px",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  badgeValue: {
    fontSize: "18px",
    color: "#1e3c72",
    letterSpacing: "0.1em",
  },
  sectionLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: "0 0 12px",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  card: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    border: "0.5px solid #e8eef7",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  cardLabel: {
    fontSize: "12px",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: "0 0 8px",
  },
  cardValue: {
    fontSize: "26px",
    fontWeight: "600",
    color: "#1e3c72",
    margin: 0,
  },
  buttonRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  btn: {
    padding: "10px 18px",
    background: "#1e3c72",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  },
  panel: {
    background: "white",
    padding: "24px",
    borderRadius: "12px",
    border: "0.5px solid #e8eef7",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  panelTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e3c72",
    marginTop: 0,
    marginBottom: "16px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  th: {
    textAlign: "left",
    padding: "10px 14px",
    backgroundColor: "#f4f7fc",
    color: "#64748b",
    fontWeight: "500",
    borderBottom: "0.5px solid #e2e8f0",
  },
  td: {
    padding: "12px 14px",
    borderBottom: "0.5px solid #f1f5f9",
    color: "#1e293b",
  },
  empty: {
    color: "#94a3b8",
    fontSize: "14px",
  },
};

export default Dashboard;