import { useEffect, useState } from "react";
import axios from "axios";

function useNotifications(user) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const buildPaidNotifications = (bills, sourceLabel) => {
      const now = new Date();
      return bills
        .filter((b) => b.status?.toLowerCase() === "paid" && b.paid_at)
        .filter((b) => {
          const paidDate = new Date(b.paid_at);
          const daysSince = (now - paidDate) / (1000 * 60 * 60 * 24);
          return daysSince <= 7;
        })
        .map((b) => ({
          type: "bill-paid",
          urgency: -1000,
          text: `${sourceLabel}: "${b.title}" marked paid on ${new Date(
            b.paid_at
          ).toLocaleDateString("en-IN")}`,
          date: new Date(b.paid_at),
        }));
    };

    const buildBillNotifications = (bills, sourceLabel) => {
      const today = new Date();
      return bills
        .filter((b) => b.status?.toLowerCase() !== "paid")
        .map((b) => {
          const due = new Date(b.due_date);
          const daysLeft = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

          let label = null;
          if (daysLeft < 0) label = "Overdue";
          else if (daysLeft <= 1) label = "Due tomorrow";
          else if (daysLeft <= 7) label = "Due this week";
          else if (daysLeft <= 30) label = "Due this month";

          if (!label) return null;

          return {
            type: "bill",
            urgency: daysLeft,
            text: `${sourceLabel}: "${b.title}" — ${label} (₹${b.amount})`,
            date: due,
          };
        })
        .filter(Boolean);
    };

    const promises = [
      axios.get(`http://localhost:5000/api/bills/personal/${user.id}`)
        .then((res) => [
          ...buildBillNotifications(res.data, "Personal bill"),
          ...buildPaidNotifications(res.data, "Personal bill"),
        ]),
    ];

    if (user.households?.length > 0) {
      user.households.forEach((h) => {
        promises.push(
          axios
            .get(`http://localhost:5000/api/bills/household/${h.household_id}`)
            .then((res) => [
              ...buildBillNotifications(res.data, `${h.household_name} bill`),
              ...buildPaidNotifications(res.data, `${h.household_name} bill`),
            ])
        );
      });
    }

    if (user.username) {
      promises.push(
        axios
          .get(`http://localhost:5000/api/invites/pending/${user.username}`)
          .then((res) =>
            res.data.map((inv) => {
              if (inv.status === "pending") {
                return {
                  type: "invite",
                  urgency: -9999,
                  text: `${inv.from_name} invited you to "${inv.household_name}" on ${new Date(
                    inv.created_at
                  ).toLocaleDateString("en-IN")}`,
                  date: new Date(inv.created_at),
                };
              }
              const action = inv.status === "accepted" ? "Accepted" : "Declined";
              return {
                type: "invite-history",
                urgency: -5000,
                text: `${action} invite to "${inv.household_name}" (sent ${new Date(
                  inv.created_at
                ).toLocaleDateString("en-IN")})`,
                date: new Date(inv.created_at),
              };
            })
          )
      );
    }

    Promise.all(promises)
      .then((results) => {
        const all = results.flat();
        all.sort((a, b) => a.urgency - b.urgency || b.date - a.date);
        setNotifications(all);
      })
      .catch((err) => console.error("Error building notifications:", err))
      .finally(() => setLoading(false));
  }, [user?.id, user?.household_id, user?.username,user]);

  return { notifications, loading };
}

export default useNotifications;