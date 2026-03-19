const express = require("express");
const cors = require("cors");

const ordersRoutes = require("./routes/orders");
const app = express();
app.use(express.json());

// middleware
app.use(cors());

// routes
app.use("/api/orders", ordersRoutes);
app.use("/api/auth", require("./routes/auth"));

// test route
app.get("/", (req, res) => {
  res.send("DataLens API is running...");
});

// start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/debug-users", (req, res) => {
  const db = require("./db");

  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) return res.json(err);
    res.json(rows);
  });
});
app.use(cors({
  origin: "*"
}));
