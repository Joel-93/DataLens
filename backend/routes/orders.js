const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth");

// =======================
// GET ALL ORDERS
// =======================
router.get("/",auth, (req, res) => {

  db.all("SELECT * FROM orders ORDER BY createdAt DESC", [], (err, rows) => {

    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }

    res.json(rows.map(row => ({
      ...row,
      totalAmount: row.totalAmount || 0
    })));

  });

});


// =======================
// CREATE ORDER
// =======================
router.post("/", auth, (req, res) => {

  const order = req.body;

  const id = "ORD-" + Date.now();

  const sql = `
  INSERT INTO orders (
    id, firstName, lastName, email, phone,
    streetAddress, city, state, postalCode, country,
    product, quantity, unitPrice, totalAmount,
    status, createdBy, createdAt
  )
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;

  const values = [
    id,
    order.firstName,
    order.lastName,
    order.email,
    order.phone,
    order.streetAddress,
    order.city,
    order.state,
    order.postalCode,
    order.country,
    order.product,
    order.quantity,
    order.unitPrice,
    order.quantity * order.unitPrice,
    order.status || "Pending",
    order.createdBy || "user",
    new Date().toISOString()
  ];

  db.run(sql, values, function (err) {

    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }

    res.json({
      id,
      ...order,
      totalAmount: order.quantity * order.unitPrice,
      status: order.status || "Pending",
      createdBy: order.createdBy || "user",
      createdAt: new Date().toISOString()
    });

  });

});


// =======================
// UPDATE ORDER
// =======================
router.put("/:id", auth, (req, res) => {

  const id = req.params.id;
  const order = req.body;

  const sql = `
  UPDATE orders SET
    firstName = ?,
    lastName = ?,
    email = ?,
    phone = ?,
    streetAddress = ?,
    city = ?,
    state = ?,
    postalCode = ?,
    country = ?,
    product = ?,
    quantity = ?,
    unitPrice = ?,
    totalAmount = ?,
    status = ?
  WHERE id = ?
  `;

  const values = [
    order.firstName,
    order.lastName,
    order.email,
    order.phone,
    order.streetAddress,
    order.city,
    order.state,
    order.postalCode,
    order.country,
    order.product,
    order.quantity,
    order.unitPrice,
    (order.quantity || 0) * (order.unitPrice || 0), // ✅ FIXED
    order.status,
    id
  ];

  db.run(sql, values, function (err) {

    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }

    res.json({
      success: true,
      updatedId: id
    });

  });

});


// =======================
// DELETE ORDER
// =======================
router.delete("/:id", auth, (req, res) => {

  const id = req.params.id;

  db.run("DELETE FROM orders WHERE id = ?", [id], function (err) {

    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }

    res.json({
      success: true,
      deletedId: id
    });

  });

});


module.exports = router;