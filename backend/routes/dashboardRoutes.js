const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET DASHBOARD DATA
router.get("/:householdId", (req, res) => {
  const { householdId } = req.params;

  db.query(
    "SELECT * FROM bills WHERE household_id = ?",
    [householdId],
    (err, results) => {
      if (err) return res.status(500).json(err);

      let total = results.length;
      let pending = 0;
      let paid = 0;
      let totalAmount = 0;

      results.forEach((bill) => {
        totalAmount += Number(bill.amount);

        if (bill.status === "Paid") paid++;
        else pending++;
      });

      res.json({
        totalBills: total,
        pendingBills: pending,
        paidBills: paid,
        totalAmount,
        recentBills: results.slice(-3).reverse(),
      });
    }
  );
});

module.exports = router;