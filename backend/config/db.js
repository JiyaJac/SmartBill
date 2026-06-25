const { Pool } = require('pg');

const pool = new Pool({
  host: 'db.lefblwcrekmdijpjrqfb.supabase.co',
  user: 'postgres',
  password: 'xLWtsltCffi4xwmC',
  database: 'postgres',
  port: 5432,
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