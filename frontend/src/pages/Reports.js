import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function Reports() {
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
  const [familyMonthlyData, setFamilyMonthlyData] = useState([]);
  const [personalMonthlyData, setPersonalMonthlyData] = useState([]);
  const [familyPaidBills, setFamilyPaidBills] = useState([]);
  const [familyUnpaidBills, setFamilyUnpaidBills] = useState([]);
  const [personalPaidBills, setPersonalPaidBills] = useState([]);
  const [personalUnpaidBills, setPersonalUnpaidBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const activeHousehold = JSON.parse(localStorage.getItem("activeHousehold"));

  useEffect(() => {
    if (!user) return;

    const promises = [];

    // personal bills
    promises.push(
      axios.get(`http://localhost:5000/api/bills/personal/${user.id}`)
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
            (sum, b) => sum + parseFloat(b.amount), 0
          );

          setPersonalStats({ thisMonth: thisMonthTotal, total });
          setPersonalPaidBills(
            bills.filter((b) => b.status?.toLowerCase() === "paid")
          );
          setPersonalUnpaidBills(
            bills.filter((b) => b.status?.toLowerCase() !== "paid")
          );

          // build personal monthly data from bills directly
          const monthMap = {};
          bills.forEach((b) => {
            const key = new Date(b.due_date).toLocaleDateString("en-IN", {
              month: "short",
              year: "numeric",
            });
            monthMap[key] = (monthMap[key] || 0) + parseFloat(b.amount);
          });
          setPersonalMonthlyData(
            Object.entries(monthMap).map(([month, total]) => ({ month, total }))
          );
        })
    );

    // family data
    if (activeHousehold?.household_id) {
      const hid = activeHousehold.household_id;

      promises.push(
        axios.get(`http://localhost:5000/api/reports/stats/${hid}`)
          .then((res) => {
            setFamilyStats({
              totalExpenses: parseFloat(res.data.totalExpenses) || 0,
              paidBills: parseInt(res.data.paidBills) || 0,
              pendingBills: parseInt(res.data.pendingBills) || 0,
              thisMonth: parseFloat(res.data.thisMonth) || 0,
            });
          })
      );

      promises.push(
        axios.get(`http://localhost:5000/api/reports/monthly/${hid}`)
          .then((res) => {
            setFamilyMonthlyData(
              res.data.map((row) => ({
                month: row.month,
                total: parseFloat(row.total) || 0,
              }))
            );
          })
      );

      promises.push(
        axios.get(`http://localhost:5000/api/bills/household/${hid}`)
          .then((res) => {
            const bills = res.data;
            setFamilyPaidBills(
              bills.filter((b) => b.status?.toLowerCase() === "paid")
            );
            setFamilyUnpaidBills(
              bills.filter((b) => b.status?.toLowerCase() !== "paid")
            );
          })
      );
    }

    Promise.all(promises)
      .catch((err) => console.error("Error fetching reports:", err))
      .finally(() => setLoading(false));

  }, [activeHousehold?.household_id, user]);

  const getStatusStyle = (bill) => {
    const today = new Date();
    const due = new Date(bill.due_date);
    if (bill.status?.toLowerCase() !== "paid" && due < today) {
      return { color: "#dc2626", fontWeight: "500" };
    }
    return { color: "#854f0b", fontWeight: "500" };
  };

  const renderBillTable = (bills, showAddedBy = false) => (
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
        {bills.length === 0 ? (
          <tr>
            <td colSpan={showAddedBy ? 5 : 4} style={styles.empty}>
              No bills found.
            </td>
          </tr>
        ) : (
          bills.map((bill) => {
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
                <td style={{
                  ...styles.td,
                  ...(status === "Paid"
                    ? { color: "#0f6e56", fontWeight: "500" }
                    : getStatusStyle(bill)),
                }}>
                  {status}
                </td>
                {showAddedBy && (
                  <td style={styles.td}>{bill.added_by || "—"}</td>
                )}
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );

  const renderChart = (data) => (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) =>
            `₹${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v}`
          }
        />
        <Tooltip
          formatter={(value) => [
            `₹${value.toLocaleString("en-IN")}`,
            "Expenses",
          ]}
          contentStyle={{
            borderRadius: "8px",
            border: "0.5px solid #e2e8f0",
            fontSize: "13px",
          }}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#1e3c72"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#1e3c72", strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <Layout>
      <div style={styles.page}>

        <div style={styles.header}>
          <h1 style={styles.title}>Reports & Analytics</h1>
          <p style={styles.subtitle}>
            {activeHousehold?.household_name || "Household"} — overview of finances
          </p>
        </div>

        {/* ── Personal Section ── */}
        <p style={styles.sectionLabel}>My Spending</p>

        <div style={styles.cardGrid}>
          <div style={{ ...styles.summaryCard, background: "#faeeda" }}>
            <div style={styles.cardIcon}>📅</div>
            <p style={{ ...styles.cardLabel, color: "#854f0b" }}>This Month</p>
            <p style={{ ...styles.cardValue, color: "#854f0b" }}>
              {loading ? "—" : `₹${personalStats.thisMonth.toLocaleString("en-IN")}`}
            </p>
          </div>
          <div style={{ ...styles.summaryCard, background: "#e8eef7" }}>
            <div style={styles.cardIcon}>💳</div>
            <p style={{ ...styles.cardLabel, color: "#1e3c72" }}>Total Personal</p>
            <p style={{ ...styles.cardValue, color: "#1e3c72" }}>
              {loading ? "—" : `₹${personalStats.total.toLocaleString("en-IN")}`}
            </p>
          </div>
          <div style={{ ...styles.summaryCard, background: "#e1f5ee" }}>
            <div style={styles.cardIcon}>✅</div>
            <p style={{ ...styles.cardLabel, color: "#0f6e56" }}>Paid</p>
            <p style={{ ...styles.cardValue, color: "#0f6e56" }}>
              {loading ? "—" : personalPaidBills.length}
            </p>
          </div>
          <div style={{ ...styles.summaryCard, background: "#fcebeb" }}>
            <div style={styles.cardIcon}>⏳</div>
            <p style={{ ...styles.cardLabel, color: "#a32d2d" }}>Unpaid</p>
            <p style={{ ...styles.cardValue, color: "#a32d2d" }}>
              {loading ? "—" : personalUnpaidBills.length}
            </p>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>My Monthly Spending</h2>
          <p style={styles.cardSubtitle}>Personal bill trend over time</p>
          {loading ? (
            <div style={styles.loadingBox}>Loading...</div>
          ) : personalMonthlyData.length === 0 ? (
            <div style={styles.loadingBox}>No personal data yet</div>
          ) : (
            renderChart(personalMonthlyData)
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>⏳ My Unpaid Bills</h2>
          <p style={styles.cardSubtitle}>
            {personalUnpaidBills.length} bill{personalUnpaidBills.length !== 1 ? "s" : ""} pending
          </p>
          {loading ? <div style={styles.loadingBox}>Loading...</div> : renderBillTable(personalUnpaidBills)}
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>✅ My Paid Bills</h2>
          <p style={styles.cardSubtitle}>
            {personalPaidBills.length} bill{personalPaidBills.length !== 1 ? "s" : ""} completed
          </p>
          {loading ? <div style={styles.loadingBox}>Loading...</div> : renderBillTable(personalPaidBills)}
        </div>

        {/* ── Family Section ── */}
        <p style={{ ...styles.sectionLabel, marginTop: "8px" }}>
          {activeHousehold?.household_name || "Family"} Spending
        </p>

        <div style={styles.cardGrid}>
          <div style={{ ...styles.summaryCard, background: "#faeeda" }}>
            <div style={styles.cardIcon}>📅</div>
            <p style={{ ...styles.cardLabel, color: "#854f0b" }}>This Month</p>
            <p style={{ ...styles.cardValue, color: "#854f0b" }}>
              {loading ? "—" : `₹${familyStats.thisMonth.toLocaleString("en-IN")}`}
            </p>
          </div>
          <div style={{ ...styles.summaryCard, background: "#e8eef7" }}>
            <div style={styles.cardIcon}>💰</div>
            <p style={{ ...styles.cardLabel, color: "#1e3c72" }}>Total Expenses</p>
            <p style={{ ...styles.cardValue, color: "#1e3c72" }}>
              {loading ? "—" : `₹${familyStats.totalExpenses.toLocaleString("en-IN")}`}
            </p>
          </div>
          <div style={{ ...styles.summaryCard, background: "#e1f5ee" }}>
            <div style={styles.cardIcon}>✅</div>
            <p style={{ ...styles.cardLabel, color: "#0f6e56" }}>Paid</p>
            <p style={{ ...styles.cardValue, color: "#0f6e56" }}>
              {loading ? "—" : familyStats.paidBills}
            </p>
          </div>
          <div style={{ ...styles.summaryCard, background: "#fcebeb" }}>
            <div style={styles.cardIcon}>⏳</div>
            <p style={{ ...styles.cardLabel, color: "#a32d2d" }}>Pending</p>
            <p style={{ ...styles.cardValue, color: "#a32d2d" }}>
              {loading ? "—" : familyStats.pendingBills}
            </p>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Family Monthly Expenses</h2>
          <p style={styles.cardSubtitle}>Family spending trend over time</p>
          {loading ? (
            <div style={styles.loadingBox}>Loading...</div>
          ) : familyMonthlyData.length === 0 ? (
            <div style={styles.loadingBox}>No family data yet</div>
          ) : (
            renderChart(familyMonthlyData)
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>⏳ Family Unpaid Bills</h2>
          <p style={styles.cardSubtitle}>
            {familyUnpaidBills.length} bill{familyUnpaidBills.length !== 1 ? "s" : ""} pending
          </p>
          {loading ? <div style={styles.loadingBox}>Loading...</div> : renderBillTable(familyUnpaidBills, true)}
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>✅ Family Paid Bills</h2>
          <p style={styles.cardSubtitle}>
            {familyPaidBills.length} bill{familyPaidBills.length !== 1 ? "s" : ""} completed
          </p>
          {loading ? <div style={styles.loadingBox}>Loading...</div> : renderBillTable(familyPaidBills, true)}
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
  header: { marginBottom: "24px" },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1e3c72",
    margin: "0 0 4px",
  },
  subtitle: { fontSize: "14px", color: "#64748b", margin: 0 },
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
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  summaryCard: {
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  cardIcon: { fontSize: "20px", marginBottom: "4px" },
  cardLabel: {
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    margin: 0,
  },
  cardValue: { fontSize: "24px", fontWeight: "700", margin: 0 },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    border: "0.5px solid #e8eef7",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 4px",
  },
  cardSubtitle: { fontSize: "13px", color: "#94a3b8", margin: "0 0 16px" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "14px" },
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
    textAlign: "center",
    padding: "24px",
    color: "#94a3b8",
    fontSize: "14px",
  },
  loadingBox: {
    height: "80px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#94a3b8",
    fontSize: "14px",
  },
};

export default Reports;