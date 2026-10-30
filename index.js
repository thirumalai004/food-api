const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Create table on startup
pool.query(`CREATE TABLE IF NOT EXISTS dishes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL
)`);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.get("/dishes", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM dishes ORDER BY id");
  res.json(rows);
});

app.post("/dishes", async (req, res) => {
  const { name, price } = req.body;
  const { rows } = await pool.query(
    "INSERT INTO dishes (name, price) VALUES ($1, $2) RETURNING *",
    [name, price]
  );
  res.status(201).json(rows[0]);
});

app.listen(process.env.PORT || 3000);