const express = require("express");
const router = express.Router();

const multer = require("multer");

const {
    addBill,
    uploadBill,
    getPersonalBills,
    getFamilyBills,
    getBillsByHousehold,
    markAsPaid
} = require("../controllers/billController");

const upload = multer({
    dest: "uploads/"
});

/*
    Add Bill
*/
router.post("/add", addBill);

/*
    Upload Bill
*/
router.post(
    "/upload",
    upload.single("bill"),
    uploadBill
);

/*
    Personal Bills
*/
router.get(
    "/personal/:userId",
    getPersonalBills
);

/*
    Family Bills
*/
router.get(
    "/family/:householdId",
    getFamilyBills
);

/*
    All Bills In Household
*/
router.get(
    "/household/:id",
    getBillsByHousehold
);

/*
    Mark Bill Paid
*/
router.patch("/pay/:id", markAsPaid);

module.exports = router;