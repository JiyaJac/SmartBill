const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect((err) => {
    if (err) {
        console.log("Database Error:", err);
    } else {
        console.log("SupaBase Connected");
    }
});

module.exports = pool;