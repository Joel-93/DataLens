const express = require("express");
const cors = require("cors");
const path = require("path");

const ordersRoutes = require("./routes/orders");

const app = express();

// middleware
app.use(express.json());
app.use(cors({
  origin: "*"
}));

// routes
app.use("/api/orders", ordersRoutes);
app.use("/api/auth", require("./routes/auth"));

// debug route
app.get("/debug-users", (req, res) => {
  const db = require("./db");

  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) return res.json(err);
    res.json(rows);
  });
});

// 🔥 SERVE FRONTEND (IMPORTANT)

// Serve static files
app.use(express.static(path.join(__dirname, "dist")));

// React fallback
// Serve static files
app.use(express.static(path.join(__dirname, "dist")));

// React fallback
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});