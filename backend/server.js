const express = require("express");
const cors = require("cors");

const ordersRoutes = require("./routes/orders");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/orders", ordersRoutes);

// test route
app.get("/", (req, res) => {
  res.send("DataLens API is running...");
});

// start server
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});