import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div
      style={{
        width: "250px",
        minHeight: "100vh",
        backgroundColor: "#1e3c72",
        color: "white",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          borderBottom: "1px solid rgba(255,255,255,0.3)",
          paddingBottom: "15px",
        }}
      >
        💡 SmartBill AI
      </h2>

      <div style={{ marginTop: "25px" }}>
        <MenuLink to="/dashboard" text="📊 Dashboard" />
        <MenuLink to="/bills" text="📄 Bills" />
        <MenuLink to="/upload-bill" text="📤 Add Bill" />
        <MenuLink to="/family-members" text="👨‍👩‍👧‍👦 Family Members" />
        <MenuLink to="/notifications" text="🔔 Notifications" />
        <MenuLink to="/reports" text="📈 Reports" />
        <MenuLink to="/settings" text="⚙️ Settings" />
      </div>
    </div>
  );
}

function MenuLink({ to, text }) {
  return (
    <Link
      to={to}
      style={{
        display: "block",
        color: "white",
        textDecoration: "none",
        padding: "12px",
        marginBottom: "8px",
        borderRadius: "8px",
        backgroundColor: "rgba(255,255,255,0.08)",
      }}
    >
      {text}
    </Link>
  );
}

export default Sidebar;