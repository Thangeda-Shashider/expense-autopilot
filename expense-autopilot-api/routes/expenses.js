const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// Add expense
router.post('/', authMiddleware, async (req, res) => {
  const { amount, category_id, description, expense_date, source } = req.body;
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      `INSERT INTO expenses (user_id, category_id, amount, description, expense_date, source)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, category_id, amount, description, expense_date || new Date(), source || 'manual']
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all expenses
router.get('/', authMiddleware, async (req, res) => {
  const user_id = req.user.id;
  try {
    const result = await pool.query(
      `SELECT e.*, c.name as category_name, c.icon as category_icon
       FROM expenses e
       LEFT JOIN categories c ON e.category_id = c.id
       WHERE e.user_id = $1
       ORDER BY e.expense_date DESC`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get spending summary
router.get('/summary', authMiddleware, async (req, res) => {
  const user_id = req.user.id;
  const period = req.query.period || 'month';
  const interval = period === 'week' ? '7 days' : '30 days';
  try {
    const result = await pool.query(
      `SELECT c.name as category, c.icon,
              SUM(e.amount) as total,
              COUNT(*) as count
       FROM expenses e
       LEFT JOIN categories c ON e.category_id = c.id
       WHERE e.user_id = $1
       AND e.expense_date >= NOW() - INTERVAL '${interval}'
       GROUP BY c.name, c.icon
       ORDER BY total DESC`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete expense
router.delete('/:id', authMiddleware, async (req, res) => {
  const user_id = req.user.id;
  const { id } = req.params;
  try {
    await pool.query(
      'DELETE FROM expenses WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;