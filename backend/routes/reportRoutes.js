const express = require("express");
const router = express.Router();

const { getReportStats, getMonthlyExpenses, getPersonalMonthlyExpenses } = require("../controllers/reportController");

router.get("/stats/:householdId", getReportStats);
router.get("/monthly/:householdId", getMonthlyExpenses);
router.get("/personal-monthly/:userId", getPersonalMonthlyExpenses);

module.exports = router;