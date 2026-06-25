const db = require("../config/db");

const getReportStats = async (req, res) => {
    try {
        const { householdId } = req.params;

        const result = await db.query(
            `SELECT
                COALESCE(SUM(amount), 0) AS total_expenses,
                COUNT(*) FILTER (WHERE status = 'Paid') AS paid_bills,
                COUNT(*) FILTER (WHERE status = 'Pending') AS pending_bills
             FROM bills
             WHERE household_id = $1
             AND bill_scope = 'family'`,
            [householdId]
        );

        const thisMonth = await db.query(
            `SELECT COALESCE(SUM(amount), 0) AS this_month
             FROM bills
             WHERE household_id = $1
             AND bill_scope = 'family'
             AND DATE_TRUNC('month', due_date) = DATE_TRUNC('month', CURRENT_DATE)`,
            [householdId]
        );

        const row = result.rows[0];
        res.json({
            totalExpenses: row.total_expenses,
            paidBills: row.paid_bills,
            pendingBills: row.pending_bills,
            thisMonth: thisMonth.rows[0].this_month
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getMonthlyExpenses = async (req, res) => {
    try {
        const { householdId } = req.params;

        const result = await db.query(
            `SELECT
                TO_CHAR(due_date, 'YYYY-Mon') AS month,
                SUM(amount) AS total
             FROM bills
             WHERE household_id = $1
             AND bill_scope = 'family'
             GROUP BY month
             ORDER BY MIN(due_date)`,
            [householdId]
        );

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getPersonalMonthlyExpenses = async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await db.query(
            `SELECT
                TO_CHAR(due_date, 'YYYY-Mon') AS month,
                SUM(amount) AS total
             FROM bills
             WHERE user_id = $1
             AND bill_scope = 'personal'
             GROUP BY month
             ORDER BY MIN(due_date)`,
            [userId]
        );

        const thisMonth = await db.query(
            `SELECT COALESCE(SUM(amount), 0) AS this_month
             FROM bills
             WHERE user_id = $1
             AND bill_scope = 'personal'
             AND DATE_TRUNC('month', due_date) = DATE_TRUNC('month', CURRENT_DATE)`,
            [userId]
        );

        res.json({
            monthly: result.rows,
            thisMonth: thisMonth.rows[0].this_month
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    getReportStats,
    getMonthlyExpenses,
    getPersonalMonthlyExpenses
};