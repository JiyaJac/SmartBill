const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
    addBill,
    scanBill,
    getPersonalBills,
    getFamilyBills,
    getBillsByHousehold,
    markAsPaid
} = require("../controllers/billController");

// ← memoryStorage so req.file.buffer is populated for Claude
const upload = multer({ storage: multer.memoryStorage() });

router.post("/add", addBill);

// ← route is now /scan, field name matches frontend's "billImage"
router.post("/scan", upload.single("billImage"), scanBill);

router.get("/personal/:userId", getPersonalBills);
router.get("/family/:householdId", getFamilyBills);
router.get("/household/:id", getBillsByHousehold);
router.patch("/pay/:id", markAsPaid);

module.exports = router;