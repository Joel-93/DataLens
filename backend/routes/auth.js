const express = require("express");
const router = express.Router();

const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ SECRET must be defined BEFORE use
const SECRET = "datalens_secret_key";

// =======================
// REGISTER
// =======================
router.post("/register", async (req, res) => {
    try {
        console.log("REGISTER BODY:", req.body);

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields required" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const role = email === "admin@datalens.com" ? "admin" : "user";

        db.run(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            [name, email, hashedPassword, role],
            function (err) {
                if (err) {
                    console.error("SQL ERROR:", err.message);
                    return res.status(400).json({ error: err.message });
                }

                console.log("USER INSERTED:", email);

                res.json({ message: "User created successfully" });
            }
        );

    } catch (err) {
        console.error("REGISTER CRASH:", err); // 🔥 THIS WILL SHOW REAL ERROR
        res.status(500).json({ error: "Server crashed" });
    }
});
// =======================
// LOGIN
// =======================
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    console.log("LOGIN BODY:", req.body); // DEBUG

    if (!email || !password) {
        return res.status(400).json({ error: "Email & password required" });
    }

    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {

        if (err) {
            console.error("DB ERROR:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (!user) {
            console.log("USER NOT FOUND");
            return res.status(400).json({ error: "User not found" });
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            console.log("WRONG PASSWORD");
            return res.status(400).json({ error: "Wrong password" });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email },
            SECRET,
            { expiresIn: "1d" }
        );

        res.json({ token, user });
    });
});
module.exports = router;