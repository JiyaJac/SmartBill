require("dotenv").config(); 

const authRoutes = require("./routes/authRoutes.js");
const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const billRoutes = require("./routes/billRoutes");
const reportRoutes =require("./routes/reportRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const inviteRoutes = require("./routes/inviteRoutes");

const app = express();
const dashboardRoutes = require("./routes/dashboardRoutes");

app.use("/api/dashboard", dashboardRoutes);
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/bills", require("./routes/billRoutes"));
app.use("/api/reports",reportRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/invites", inviteRoutes);



app.get("/", (req, res) => {
    res.send("SmartBill Backend Running");
});

// ADD THIS HERE 👇
app.get("/users", (req, res) => {

    db.query(
        "SELECT * FROM users",
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(result);
        }
    );

});

// DON'T TOUCH THIS
app.listen(5000, () => {
    console.log("Server running on port 5000");
});