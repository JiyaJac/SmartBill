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
const scanBill = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        console.log("File info:", {
            mimetype: req.file?.mimetype,
            size: req.file?.buffer?.length,
            originalname: req.file?.originalname,
        });
        if (!req.file.buffer || req.file.buffer.length === 0) {
            return res.status(400).json({ message: "File buffer empty — check Multer is using memoryStorage()" });
        }

        const Groq = require("groq-sdk");
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const base64Image = req.file.buffer.toString("base64");
        const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;

        const prompt = `You are a bill/invoice parser. Look at this bill image carefully and extract:
1. title - the company name or type of bill (e.g. "Electricity Bill", "Airtel Broadband")
2. amount - the total/final amount due as a plain number, no currency symbols
3. due_date - the payment due date in YYYY-MM-DD format
Respond with ONLY a JSON object, no markdown, no explanation, no backticks. Example:
{"title":"Electricity Bill","amount":1250.00,"due_date":"2026-07-15"}
If a field is not found, use null.`;

        const result = await groq.chat.completions.create({
            model: "meta-llama/llama-4-scout-17b-16e-instruct", // Groq's current vision model
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        { type: "image_url", image_url: { url: dataUrl } },
                    ],
                },
            ],
            temperature: 0,
            max_tokens: 512,
        });

        const raw = result.choices?.[0]?.message?.content?.trim() || "";
        console.log("Groq raw response:", raw);

        let extracted;
        try {
            // Strip markdown fences if Groq wraps in ```json ... ```
            const clean = raw.replace(/```json|```/g, "").trim();
            extracted = JSON.parse(clean);
        } catch (parseErr) {
            console.error("JSON parse failed. Raw was:", raw);
            extracted = {
                title: raw.match(/"title"\s*:\s*"([^"]+)"/)?.[1] || null,
                amount: parseFloat(raw.match(/"amount"\s*:\s*([\d.]+)/)?.[1]) || null,
                due_date: raw.match(/"due_date"\s*:\s*"([^"]+)"/)?.[1] || null,
            };
        }

        res.json({ extracted });
    } catch (err) {
        console.error("Vision scan error:", err?.message || err);
        res.status(500).json({ message: "Failed to scan bill", detail: err?.message });
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
    scanBill,
    getPersonalBills,
    getFamilyBills,
    getBillsByHousehold,
    markAsPaid
};