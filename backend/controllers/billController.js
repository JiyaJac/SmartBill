const db = require("../config/db");

/*
    Add Bill
*/
const addBill = async (req, res) => {
    try {
        const { household_id, user_id, title, amount, due_date, bill_scope, added_by } = req.body;

        const result = await db.query(
            `INSERT INTO bills
            (household_id, user_id, title, amount, due_date, bill_scope, status, added_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id`,
            [household_id, user_id, title, amount, due_date, bill_scope, "Pending", added_by]
        );

        res.json({ message: "Bill Added Successfully", billId: result.rows[0].id });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};
/*
    Get Bills By Household
*/
const getBillsByHousehold = async (req, res) => {
    try {
        const householdId = req.params.id;

        const result = await db.query(
            `SELECT * FROM bills
             WHERE household_id = $1
             AND bill_scope = 'family'
             ORDER BY due_date DESC`,
            [householdId]
        );

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

/*
    Mark Bill As Paid
*/
const markAsPaid = async (req, res) => {
    try {

        const billId = req.params.id;

        await db.query(
            "UPDATE bills SET status = 'Paid', paid_at = NOW() WHERE id = $1",
            [billId]
        );

        res.json({
            message: "Bill Marked As Paid"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
};

/*
    Upload Bill Placeholder
*/
const uploadBill = async (req, res) => {
    try {

        res.json({
            billType: "Electricity",
            amount: 1200,
            dueDate: "2026-06-25"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
};

/*
    Personal Bills
*/
const getPersonalBills = async (req, res) => {
    try {

        const userId = req.params.userId;

        const result = await db.query(
            `SELECT *
             FROM bills
             WHERE user_id = $1
             AND bill_scope = 'personal'
             ORDER BY due_date DESC`,
            [userId]
        );

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
};

/*
    Family Bills
*/
const getFamilyBills = async (req, res) => {
    try {

        const householdId = req.params.householdId;

        const result = await db.query(
            `SELECT *
             FROM bills
             WHERE household_id = $1
             AND bill_scope = 'family'
             ORDER BY due_date DESC`,
            [householdId]
        );

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
};

module.exports = {
    addBill,
    uploadBill,
    getPersonalBills,
    getFamilyBills,
    getBillsByHousehold,
    markAsPaid
};