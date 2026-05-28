const pool = require('./db');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log('Connection failed:', err);
  } else {
    console.log('Connected to Supabase! Time:', res.rows[0].now);
  }
  pool.end();
});