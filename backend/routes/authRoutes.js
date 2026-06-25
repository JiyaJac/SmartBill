const express = require("express");
const router = express.Router();
const { getNotifications, leaveFamily } = require("../controllers/authController");
const {
  registerAdmin,
  joinFamily,
  login,
  getHouseholdById,
  getFamilyMembers
} = require("../controllers/authController");
console.log({
  registerAdmin,
  joinFamily,
  login,
  getHouseholdById,
  getFamilyMembers,
  leaveFamily
});


// AUTH ROUTES
router.post("/register-admin", registerAdmin);
router.post("/join-family", joinFamily);
router.post("/login", login);

// DASHBOARD ROUTE
router.get("/household/:id", getHouseholdById);

// FAMILY MEMBERS
router.get("/family-members/:householdId", getFamilyMembers);
router.post("/leave-family", leaveFamily);

module.exports = router;