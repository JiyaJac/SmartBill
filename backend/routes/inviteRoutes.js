const express = require("express");
const router = express.Router();
const {
    sendInvite,
    getInvites,
    acceptInvite,
    declineInvite
} = require("../controllers/inviteController");

router.post("/send", sendInvite);
router.get("/pending/:username", getInvites);
router.post("/accept/:inviteId", acceptInvite);
router.post("/decline/:inviteId", declineInvite);

module.exports = router;