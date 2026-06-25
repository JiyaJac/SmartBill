import { useState } from "react";

function HouseholdSwitcher() {
  const user = JSON.parse(localStorage.getItem("user"));
  const active = JSON.parse(localStorage.getItem("activeHousehold"));
  const [open, setOpen] = useState(false);

  if (!user?.households || user.households.length <= 1) return null;

  const switchHousehold = (h) => {
    localStorage.setItem(
      "activeHousehold",
      JSON.stringify({
        household_id: h.household_id,
        household_name: h.household_name,
        role: h.role,
      })
    );
    window.location.reload();
  };

  return (
    <div style={styles.wrapper}>
      <button style={styles.trigger} onClick={() => setOpen(!open)}>
        🏠 {active?.household_name || "Select Household"} ▾
      </button>

      {open && (
        <div style={styles.dropdown}>
          {user.households.map((h) => (
            <div
              key={h.household_id}
              style={{
                ...styles.option,
                backgroundColor:
                  h.household_id === active?.household_id
                    ? "#e8eef7"
                    : "white",
              }}
              onClick={() => switchHousehold(h)}
            >
              <span style={styles.name}>{h.household_name}</span>
              <span style={styles.role}>{h.role}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    position: "relative",
    display: "inline-block",
    marginBottom: "20px",
  },
  trigger: {
    padding: "8px 16px",
    backgroundColor: "white",
    border: "0.5px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#1e3c72",
    cursor: "pointer",
    fontWeight: "500",
  },
  dropdown: {
    position: "absolute",
    top: "110%",
    left: 0,
    backgroundColor: "white",
    border: "0.5px solid #cbd5e1",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    minWidth: "200px",
    zIndex: 100,
  },
  option: {
    padding: "10px 16px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "0.5px solid #f1f5f9",
  },
  name: {
    fontSize: "14px",
    color: "#1e293b",
  },
  role: {
    fontSize: "11px",
    color: "#64748b",
    textTransform: "capitalize",
  },
};

export default HouseholdSwitcher;