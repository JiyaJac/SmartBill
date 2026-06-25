import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";

function Bills() {
  const [personalBills, setPersonalBills] = useState([]);
  const [familyBills, setFamilyBills] = useState([]);

  const fetchBills = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const activeHousehold = JSON.parse(localStorage.getItem("activeHousehold"));

    if (!user) {
      console.error("No user found");
      return;
    }

    if (!activeHousehold) {
      console.error("No active household found");
      return;
    }

    axios
      .get(`http://localhost:5000/api/bills/personal/${user.id}`)
      .then((res) => setPersonalBills(res.data))
      .catch((err) => console.error(err));

    axios
      .get(`http://localhost:5000/api/bills/family/${activeHousehold.household_id}`)
      .then((res) => setFamilyBills(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const getDisplayStatus = (bill) => {
    const today = new Date();
    const dueDate = new Date(bill.due_date);

    if (bill.status?.toLowerCase() !== "paid" && dueDate < today) {
      return "Overdue";
    }

    return bill.status || "Pending";
  };

  const markPaid = async (billId) => {
    try {
      await axios.patch(`http://localhost:5000/api/bills/pay/${billId}`);
      alert("Bill marked as paid!");
      fetchBills();
    } catch (err) {
      console.error(err);
      alert("Failed to update bill");
    }
  };

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return { color: "#0f6e56", fontWeight: "500" };
      case "overdue":
        return { color: "#dc2626", fontWeight: "500" };
      default:
        return { color: "#854f0b", fontWeight: "500" };
    }
  };

  const renderTable = (bills) => (
    <table style={styles.table}>
      <thead>
        <tr>
          <th style={styles.th}>Title</th>
          <th style={styles.th}>Amount</th>
          <th style={styles.th}>Due Date</th>
          <th style={styles.th}>Added By</th>
          <th style={styles.th}>Status</th>
          <th style={styles.th}>Action</th>
        </tr>
      </thead>
      <tbody>
        {bills.map((bill) => {
          const status = getDisplayStatus(bill);
          return (
            <tr key={bill.id} style={styles.tr}>
              <td style={styles.td}>{bill.title}</td>
              <td style={styles.td}>₹{parseFloat(bill.amount).toLocaleString("en-IN")}</td>
              <td style={styles.td}>
                {new Date(bill.due_date).toLocaleDateString("en-US", {
                  weekday: "short",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </td>
              <td style={styles.td}>
                  {bill.bill_scope === "family" ? (bill.added_by || "—") : "—"}
              </td>
              <td style={{ ...styles.td, ...getStatusStyle(status) }}>
                {status}
              </td>
              <td style={styles.td}>
                {bill.status?.toLowerCase() !== "paid" ? (
                  <button
                    onClick={() => markPaid(bill.id)}
                    style={styles.btn}
                  >
                    Mark as Paid
                  </button>
                ) : (
                  <span style={{ color: "#0f6e56" }}>✅ Paid</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <Layout>
      <div style={styles.page}>
        <h1 style={styles.title}>Bills Dashboard</h1>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>My Bills</h2>
          {personalBills.length === 0 ? (
            <p style={styles.empty}>No personal bills found.</p>
          ) : (
            renderTable(personalBills)
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Family Bills</h2>
          {familyBills.length === 0 ? (
            <p style={styles.empty}>No family bills found.</p>
          ) : (
            renderTable(familyBills)
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
  title: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1e3c72",
    marginBottom: "24px",
  },
  card: {
    backgroundColor: "white",
    padding: "24px",
    marginBottom: "24px",
    borderRadius: "12px",
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
  tr: {
    transition: "background 0.15s",
  },
  btn: {
    backgroundColor: "#1e3c72",
    color: "white",
    border: "none",
    padding: "7px 14px",
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer",
  },
  empty: {
    color: "#94a3b8",
    fontSize: "14px",
  },
};

export default Bills;