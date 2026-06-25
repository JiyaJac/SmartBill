const db = require("../config/db");

const getProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await db.query(
            `SELECT id, name, email, username, role, household_id
             FROM users WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, email } = req.body;

        await db.query(
            `UPDATE users SET name = $1, email = $2 WHERE id = $3`,
            [name, email, userId]
        );

        res.json({ message: "Profile updated successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const changePassword = async (req, res) => {
    try {
        const { userId } = req.params;
        const { currentPassword, newPassword } = req.body;

        const result = await db.query(
            "SELECT password FROM users WHERE id = $1",
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        if (result.rows[0].password !== currentPassword) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        await db.query(
            "UPDATE users SET password = $1 WHERE id = $2",
            [newPassword, userId]
        );

        res.json({ message: "Password changed successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getPreferences = async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await db.query(
            `SELECT email_notifications, due_date_alerts
             FROM users WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updatePreferences = async (req, res) => {
    try {
        const { userId } = req.params;
        const { email_notifications, due_date_alerts } = req.body;

        await db.query(
            `UPDATE users
             SET email_notifications = $1, due_date_alerts = $2
             WHERE id = $3`,
            [email_notifications, due_date_alerts, userId]
        );

        res.json({ message: "Preferences updated successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    getPreferences,
    updatePreferences,
};