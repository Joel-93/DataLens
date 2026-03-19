const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Ensure database path always works
const dbPath = path.join(__dirname, "database.sqlite");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("Connected to SQLite database");

    // Create orders table if not exists
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        firstName TEXT,
        lastName TEXT,
        email TEXT,
        phone TEXT,
        streetAddress TEXT,
        city TEXT,
        state TEXT,
        postalCode TEXT,
        country TEXT,
        product TEXT,
        quantity INTEGER,
        unitPrice INTEGER,
        totalAmount INTEGER,
        status TEXT,
        createdBy TEXT,
        createdAt TEXT
      )
    `, (err) => {
      if (err) {
        console.error("Error creating orders table:", err.message);
      } else {
        console.log("Orders table ready");
      }
    });

  }
});

module.exports = db;