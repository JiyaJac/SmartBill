const db = require("../config/db");

const registerAdmin = async (req, res) => {
    try {
        const { household_name, name, email, username, password } = req.body;

        const existing = await db.query(
            "SELECT id FROM users WHERE username = $1",
            [username]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({ message: "Username already taken" });
        }

        const inviteCode = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

        const householdResult = await db.query(
            `INSERT INTO households (household_name, invite_code)
             VALUES ($1, $2) RETURNING id`,
            [household_name, inviteCode]
        );

        const householdId = householdResult.rows[0].id;

        await db.query(
            `INSERT INTO users (name, email, username, password, role, household_id)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [name, email, username, password, "admin", householdId]
        );

        res.json({ message: "Admin Registered", inviteCode });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};


const joinFamily = async (req, res) => {
    try {
        const { invite_code, name, email, username, password } = req.body;

        const cleanInviteCode = invite_code.trim();

        const householdResult = await db.query(
            "SELECT * FROM households WHERE invite_code = $1",
            [cleanInviteCode]
        );

        if (householdResult.rows.length === 0) {
            return res.status(404).json({ message: "Invalid Invite Code" });
        }

        const householdId = householdResult.rows[0].id;
        const householdName = householdResult.rows[0].household_name;

        const existingUser = await db.query(
            "SELECT * FROM users WHERE username = $1",
            [username]
        );

        let userId;

        if (existingUser.rows.length > 0) {
            const user = existingUser.rows[0];

            if (user.password !== password) {
                return res.status(401).json({ message: "Incorrect password" });
            }

            const alreadyMember = await db.query(
                "SELECT id FROM household_members WHERE user_id = $1 AND household_id = $2",
                [user.id, householdId]
            );

            if (alreadyMember.rows.length > 0) {
                return res.status(400).json({ message: "You are already in this family" });
            }

            // also check if it's their primary household
            if (user.household_id === householdId) {
                return res.status(400).json({ message: "You are already in this family" });
            }

            userId = user.id;

        } else {
            const newUser = await db.query(
                `INSERT INTO users (name, email, username, password, role, household_id)
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
                [name, email, username, password, "member", householdId]
            );
            userId = newUser.rows[0].id;

            // for new users, primary household is set so no need for household_members
            return res.json({
                message: "Joined Family Successfully",
                household_name: householdName,
                user: { id: userId, name, username, household_id: householdId }
            });
        }

        // for existing users, add to household_members
        await db.query(
            `INSERT INTO household_members (user_id, household_id, role)
             VALUES ($1, $2, $3)`,
            [userId, householdId, "member"]
        );

        res.json({
            message: "Joined Family Successfully",
            household_name: householdName,
            user: { id: userId, username, household_id: householdId }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const result = await db.query(
            "SELECT * FROM users WHERE username = $1 AND password = $2",
            [username, password]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid Username or Password" });
        }

        const user = result.rows[0];

        // get primary household
        const primaryHousehold = [];
        if (user.household_id) {
            const ph = await db.query(
                "SELECT id AS household_id, household_name FROM households WHERE id = $1",
                [user.household_id]
            );
            if (ph.rows.length > 0) {
                primaryHousehold.push({
                    ...ph.rows[0],
                    role: user.role
                });
            }
        }

        // get extra households from household_members
        const extraHouseholds = await db.query(
            `SELECT hm.household_id, hm.role, h.household_name
             FROM household_members hm
             JOIN households h ON h.id = hm.household_id
             WHERE hm.user_id = $1`,
            [user.id]
        );

        const households = [...primaryHousehold, ...extraHouseholds.rows];

        res.json({
            message: "Login Successful",
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                household_id: user.household_id,
                households
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getHouseholdById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            "SELECT * FROM households WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Household not found" });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getFamilyMembers = async (req, res) => {
    try {
        const { householdId } = req.params;

        // get members from users table (primary household)
        const primaryMembers = await db.query(
            `SELECT id, name, username, role
             FROM users
             WHERE household_id = $1`,
            [householdId]
        );

        // get members from household_members (joined households)
        const extraMembers = await db.query(
            `SELECT u.id, u.name, u.username, hm.role
             FROM household_members hm
             JOIN users u ON u.id = hm.user_id
             WHERE hm.household_id = $1`,
            [householdId]
        );

        // merge and deduplicate by id
        const allMembers = [...primaryMembers.rows, ...extraMembers.rows];
        const unique = allMembers.filter(
            (m, index, self) => index === self.findIndex((x) => x.id === m.id)
        );

        unique.sort((a, b) => {
            if (a.role === "admin") return -1;
            if (b.role === "admin") return 1;
            return a.name.localeCompare(b.name);
        });

        res.json(unique);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

const leaveFamily = async (req, res) => {
    try {
        const { user_id, household_id } = req.body;

        const userResult = await db.query(
            "SELECT * FROM users WHERE id = $1",
            [user_id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = userResult.rows[0];

        // Case 1: leaving their PRIMARY household
        if (user.household_id === parseInt(household_id)) {
            if (user.role === "admin") {
                return res.status(403).json({
                    message: "Admins cannot leave their primary household",
                });
            }

            await db.query(
                "UPDATE users SET household_id = NULL WHERE id = $1",
                [user_id]
            );

            return res.json({ message: "Left primary household successfully" });
        }

        // Case 2: leaving a SECONDARY household (joined via household_members)
        const membership = await db.query(
            "SELECT id FROM household_members WHERE user_id = $1 AND household_id = $2",
            [user_id, household_id]
        );

        if (membership.rows.length === 0) {
            return res.status(404).json({ message: "You are not a member of this household" });
        }

        await db.query(
            "DELETE FROM household_members WHERE user_id = $1 AND household_id = $2",
            [user_id, household_id]
        );

        res.json({ message: "Left household successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    registerAdmin,
    joinFamily,
    login,
    getHouseholdById,
    getFamilyMembers,
    leaveFamily, 
};