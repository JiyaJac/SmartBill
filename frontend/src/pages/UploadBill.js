import { useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import "../styles/UploadBill.css";

function UploadBill() {
  const user = JSON.parse(localStorage.getItem("user"));
  const activeHousehold = JSON.parse(localStorage.getItem("activeHousehold"));

  const user_id = user?.id;
  const household_id = activeHousehold?.household_id;

  const [file, setFile] = useState(null);
  const [billData, setBillData] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [billScope, setBillScope] = useState("personal");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpload = async () => {
    if (!file) { setError("Please select a file"); return; }
    setScanning(true);
    setError("");

    const formData = new FormData();
    formData.append("billImage", file);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/bills/scan",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const extracted = response.data.extracted;
      setBillData(extracted);

      if (extracted.title)    setTitle(extracted.title);
      if (extracted.amount)   setAmount(extracted.amount);
      if (extracted.due_date) setDueDate(extracted.due_date);

      setError("");
    } catch (err) {
      console.error(err);
      setError("Upload failed");
    } finally {
      setScanning(false);
    }
  };

  const handleManualAdd = async () => {
    setError("");
    setSuccess("");

    if (!title || !amount || !dueDate) { setError("Please fill in all fields."); return; }
    if (!household_id) { setError("No active household selected."); return; }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/bills/add",
        {
          household_id,
          user_id,
          title,
          amount,
          due_date: dueDate,
          bill_scope: billScope,
          added_by: user?.username,
        }
      );

      setSuccess(response.data.message);
      setTitle("");
      setAmount("");
      setDueDate("");
      setBillScope("personal");
      setBillData(null);
      setFile(null);
    } catch (err) {
      console.error(err);
      setError("Failed to add bill");
    }
  };

  return (
    <Layout>
      <div className="upload-page">
        <div className="upload-header">
          <h1>Upload Bill</h1>
          <p className="subtitle">
            Adding to:{" "}
            <strong style={{ color: "#1e3c72" }}>
              {activeHousehold?.household_name || "No household selected"}
            </strong>
          </p>
        </div>

        <div className="upload-grid">

          {/* ── Card 1: Upload & Scan ── */}
          <div className="card">
            <h3>Upload Bill File</h3>

            <div className="file-row">
              <label className="file-label">
                <input
                  type="file"
                  className="file-input"
                  accept="image/*"
                  onChange={(e) => {
                    setFile(e.target.files[0]);
                    setBillData(null);
                    setError("");
                  }}
                />
                <span className="file-cta">Choose File</span>
              </label>
              <div className="file-name">
                {file ? file.name : "No file selected"}
              </div>
            </div>

            <button
              className="btn primary"
              onClick={handleUpload}
              disabled={scanning}
            >
              {scanning ? "Scanning..." : "Upload and Extract"}
            </button>

            {billData && (
              <div className="extracted">
                <h4>Extracted Information</h4>
                <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 10px" }}>
                  Review and edit the fields on the right before adding.
                </p>
                <div className="extracted-grid">
                  <div>
                    <strong>Title:</strong>
                    <div>{billData.title || "Not detected"}</div>
                  </div>
                  <div>
                    <strong>Amount:</strong>
                    <div>{billData.amount ? `₹${billData.amount}` : "Not detected"}</div>
                  </div>
                  <div>
                    <strong>Due Date:</strong>
                    <div>{billData.due_date || "Not detected"}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Card 2: Form ── */}
          <div className="card">
            <h3>Add Bill Manually</h3>

            <div className="form-row">
              <label>Bill Title</label>
              <input
                type="text"
                placeholder="Bill Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-row two-col">
              <div>
                <label>Amount</label>
                <input
                  type="number"
                  placeholder="Amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label>Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <label>Bill Scope</label>
              <select
                value={billScope}
                onChange={(e) => setBillScope(e.target.value)}
              >
                <option value="personal">Personal Bill</option>
                <option value="family">Family Bill</option>
              </select>
            </div>

            {error && (
              <p style={{ color: "#dc2626", fontSize: "13px", margin: "8px 0" }}>
                {error}
              </p>
            )}
            {success && (
              <p style={{ color: "#0f6e56", fontSize: "13px", margin: "8px 0" }}>
                {success}
              </p>
            )}

            <div className="actions">
              <button className="btn" onClick={handleManualAdd}>
                Add Bill
              </button>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}

export default UploadBill;