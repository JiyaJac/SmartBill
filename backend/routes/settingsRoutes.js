const express = require("express");
const router = express.Router();

const {
    getProfile,
    updateProfile,
    changePassword,
    getPreferences,
    updatePreferences,
} = require("../controllers/settingsController");

router.get("/profile/:userId",         getProfile);
router.put("/profile/:userId",         updateProfile);
router.put("/change-password/:userId", changePassword);
router.get("/preferences/:userId",     getPreferences);
router.put("/preferences/:userId",     updatePreferences);

module.exports = router;