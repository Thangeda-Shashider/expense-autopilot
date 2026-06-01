const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// Get all categories for user
router.get('/', authMiddleware, async (req, res) => {
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      'SELECT * FROM categories WHERE user_id = $1 OR is_default = true',
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add custom category
router.post('/', authMiddleware, async (req, res) => {
  const { name, icon } = req.body;
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      'INSERT INTO categories (user_id, name, icon) VALUES ($1, $2, $3) RETURNING *',
      [user_id, name, icon]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;