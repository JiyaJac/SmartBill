const db = require("../config/db");

const sendInvite = async (req, res) => {
    try {
        const { from_user_id, to_username, household_id, invite_code } = req.body;

        const toUser = await db.query(
            "SELECT id FROM users WHERE username = $1",
            [to_username]
        );

        if (toUser.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const existing = await db.query(
            `SELECT id FROM invites
             WHERE to_username = $1 AND household_id = $2 AND status = 'pending'`,
            [to_username, household_id]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ message: "Invite already sent to this user" });
        }

        await db.query(
            `INSERT INTO invites (from_user_id, to_username, household_id, invite_code)
             VALUES ($1, $2, $3, $4)`,
            [from_user_id, to_username, household_id, invite_code]
        );

        res.json({ message: "Invite sent successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getInvites = async (req, res) => {
    try {
        const { username } = req.params;

        const result = await db.query(
            `SELECT i.id, i.invite_code, i.status, i.created_at,
                    h.household_name, u.name AS from_name
             FROM invites i
             JOIN households h ON h.id = i.household_id
             JOIN users u ON u.id = i.from_user_id
             WHERE i.to_username = $1
               AND (
                 i.status = 'pending'
                 OR i.created_at > NOW() - INTERVAL '30 days'
               )
             ORDER BY i.created_at DESC`,
            [username]
        );

        res.json(result.rows);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const acceptInvite = async (req, res) => {
    try {
        const { inviteId } = req.params;

        const invite = await db.query(
            "SELECT * FROM invites WHERE id = $1",
            [inviteId]
        );

        if (invite.rows.length === 0) {
            return res.status(404).json({ message: "Invite not found" });
        }

        const { to_username, household_id } = invite.rows[0];

        const user = await db.query(
            "SELECT * FROM users WHERE username = $1",
            [to_username]
        );

        const userId = user.rows[0].id;

        // check if already a member
        const alreadyMember = await db.query(
            "SELECT id FROM household_members WHERE user_id = $1 AND household_id = $2",
            [userId, household_id]
        );

        if (alreadyMember.rows.length === 0 && user.rows[0].household_id !== household_id) {
            await db.query(
                `INSERT INTO household_members (user_id, household_id, role)
                 VALUES ($1, $2, $3)`,
                [userId, household_id, "member"]
            );
        }

        await db.query(
            "UPDATE invites SET status = 'accepted' WHERE id = $1",
            [inviteId]
        );

        // fetch household name to send back to frontend
        const household = await db.query(
            "SELECT household_name FROM households WHERE id = $1",
            [household_id]
        );

        res.json({
            message: "Invite accepted",
            household: {
                household_id,
                household_name: household.rows[0]?.household_name,
                role: "member",
            },
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const declineInvite = async (req, res) => {
    try {
        const { inviteId } = req.params;

        await db.query(
            "UPDATE invites SET status = 'declined' WHERE id = $1",
            [inviteId]
        );

        res.json({ message: "Invite declined" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { sendInvite, getInvites, acceptInvite, declineInvite };