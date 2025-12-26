// Trading Planner Routes
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all trades
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM trades WHERE user_id = $1 ORDER BY trade_date DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching trades:', error);
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
});

// Get trade by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM trades WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trade not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching trade:', error);
    res.status(500).json({ error: 'Failed to fetch trade' });
  }
});

// Create trade
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { symbol, entryPrice, exitPrice, contracts, direction, setupType, notes, pl } = req.body;
    const result = await pool.query(
      `INSERT INTO trades (user_id, symbol, entry_price, exit_price, contracts, direction, setup_type, notes, pl)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [req.user.userId, symbol, entryPrice, exitPrice, contracts, direction, setupType, notes, pl]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating trade:', error);
    res.status(500).json({ error: 'Failed to create trade' });
  }
});

// Update trade
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { symbol, entryPrice, exitPrice, contracts, direction, setupType, notes, pl } = req.body;
    const result = await pool.query(
      `UPDATE trades
       SET symbol = $1, entry_price = $2, exit_price = $3, contracts = $4, direction = $5, setup_type = $6, notes = $7, pl = $8
       WHERE id = $9 AND user_id = $10
       RETURNING *`,
      [symbol, entryPrice, exitPrice, contracts, direction, setupType, notes, pl, req.params.id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trade not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating trade:', error);
    res.status(500).json({ error: 'Failed to update trade' });
  }
});

// Delete trade
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM trades WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Trade not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting trade:', error);
    res.status(500).json({ error: 'Failed to delete trade' });
  }
});

// Get trading mode
router.get('/mode', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT mode FROM trading_mode WHERE user_id = $1',
      [req.user.userId]
    );
    res.json({ mode: result.rows[0]?.mode || 'futures' });
  } catch (error) {
    console.error('Error fetching mode:', error);
    res.status(500).json({ error: 'Failed to fetch mode' });
  }
});

// Save trading mode
router.post('/mode', authenticateToken, async (req, res) => {
  try {
    const { mode } = req.body;
    await pool.query(
      `INSERT INTO trading_mode (user_id, mode)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET mode = $2`,
      [req.user.userId, mode]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving mode:', error);
    res.status(500).json({ error: 'Failed to save mode' });
  }
});

module.exports = router;

