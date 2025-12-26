// Trading Planner Routes - Complete Implementation
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// ===== TRADES =====
// Get all trades
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM trades WHERE user_id = $1 ORDER BY COALESCE(exit_date, trade_date) DESC',
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
    const { symbol, entryPrice, exitPrice, contracts, shares, direction, setupType, notes, pl, exitReason, exitDate, mode } = req.body;
    const result = await pool.query(
      `INSERT INTO trades (user_id, symbol, entry_price, exit_price, contracts, shares, direction, setup_type, notes, pl, exit_reason, exit_date, mode, trade_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [req.user.userId, symbol, entryPrice, exitPrice, contracts || null, shares || null, direction, setupType || null, notes || null, pl, exitReason || null, exitDate || null, mode || 'futures', new Date()]
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
    const { symbol, entryPrice, exitPrice, contracts, shares, direction, setupType, notes, pl, exitReason, exitDate, mode } = req.body;
    const result = await pool.query(
      `UPDATE trades
       SET symbol = $1, entry_price = $2, exit_price = $3, contracts = $4, shares = $5, direction = $6, setup_type = $7, notes = $8, pl = $9, exit_reason = $10, exit_date = $11, mode = $12
       WHERE id = $13 AND user_id = $14
       RETURNING *`,
      [symbol, entryPrice, exitPrice, contracts || null, shares || null, direction, setupType || null, notes || null, pl, exitReason || null, exitDate || null, mode || 'futures', req.params.id, req.user.userId]
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

// ===== POSITIONS =====
// Get all positions
router.get('/positions', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM trading_positions WHERE user_id = $1 ORDER BY entry_date DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({ error: 'Failed to fetch positions' });
  }
});

// Create position
router.post('/positions', authenticateToken, async (req, res) => {
  try {
    const { symbol, direction, entryPrice, size, stopLoss, takeProfit, currentPrice, setupType, mode } = req.body;
    const result = await pool.query(
      `INSERT INTO trading_positions (user_id, symbol, direction, entry_price, size, stop_loss, take_profit, current_price, setup_type, mode)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [req.user.userId, symbol, direction, entryPrice, size, stopLoss || null, takeProfit || null, currentPrice || entryPrice, setupType || null, mode || 'futures']
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating position:', error);
    res.status(500).json({ error: 'Failed to create position' });
  }
});

// Update position
router.put('/positions/:id', authenticateToken, async (req, res) => {
  try {
    const { currentPrice, stopLoss, takeProfit } = req.body;
    const result = await pool.query(
      `UPDATE trading_positions
       SET current_price = COALESCE($1, current_price), stop_loss = COALESCE($2, stop_loss), take_profit = COALESCE($3, take_profit), updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [currentPrice, stopLoss, takeProfit, req.params.id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Position not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating position:', error);
    res.status(500).json({ error: 'Failed to update position' });
  }
});

// Delete position
router.delete('/positions/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM trading_positions WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Position not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting position:', error);
    res.status(500).json({ error: 'Failed to delete position' });
  }
});

// ===== SETTINGS =====
// Get settings
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM trading_settings WHERE user_id = $1',
      [req.user.userId]
    );
    if (result.rows.length === 0) {
      // Return defaults
      return res.json({
        futures_balance: 10000.00,
        stocks_balance: 195000.00,
        daily_loss_limit: 500.00,
        max_risk_per_trade: 2.00
      });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Save settings
router.post('/settings', authenticateToken, async (req, res) => {
  try {
    const { futuresBalance, stocksBalance, dailyLossLimit, maxRiskPerTrade } = req.body;
    const result = await pool.query(
      `INSERT INTO trading_settings (user_id, futures_balance, stocks_balance, daily_loss_limit, max_risk_per_trade)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET
         futures_balance = $2,
         stocks_balance = $3,
         daily_loss_limit = $4,
         max_risk_per_trade = $5,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.user.userId, futuresBalance, stocksBalance, dailyLossLimit, maxRiskPerTrade]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// ===== MODE =====
// Get trading mode
router.get('/mode', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT mode FROM trading_mode WHERE user_id = $1',
      [req.user.userId]
    );
    res.json({ mode: (result.rows[0] && result.rows[0].mode) || 'futures' });
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

// ===== PLANNED TRADES =====
// Get planned trades
router.get('/planned-trades', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM trading_planned_trades WHERE user_id = $1 ORDER BY date DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching planned trades:', error);
    res.status(500).json({ error: 'Failed to fetch planned trades' });
  }
});

// Create planned trade
router.post('/planned-trades', authenticateToken, async (req, res) => {
  try {
    const { symbol, direction, entryPrice, stopLoss, target, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO trading_planned_trades (user_id, symbol, direction, entry_price, stop_loss, target, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.userId, symbol, direction, entryPrice, stopLoss || null, target || null, notes || null]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating planned trade:', error);
    res.status(500).json({ error: 'Failed to create planned trade' });
  }
});

// Delete planned trade
router.delete('/planned-trades/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM trading_planned_trades WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Planned trade not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting planned trade:', error);
    res.status(500).json({ error: 'Failed to delete planned trade' });
  }
});

// ===== KEY LEVELS =====
// Get key levels
router.get('/key-levels', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM trading_key_levels WHERE user_id = $1 ORDER BY date DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching key levels:', error);
    res.status(500).json({ error: 'Failed to fetch key levels' });
  }
});

// Create key level
router.post('/key-levels', authenticateToken, async (req, res) => {
  try {
    const { symbol, price, type, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO trading_key_levels (user_id, symbol, price, type, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.userId, symbol, price, type, notes || null]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating key level:', error);
    res.status(500).json({ error: 'Failed to create key level' });
  }
});

// Delete key level
router.delete('/key-levels/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM trading_key_levels WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Key level not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting key level:', error);
    res.status(500).json({ error: 'Failed to delete key level' });
  }
});

// ===== EXECUTION STAGES =====
// Get execution stages
router.get('/execution-stages', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT stage_data FROM trading_execution_stages WHERE user_id = $1',
      [req.user.userId]
    );
    res.json({ stages: (result.rows[0] && result.rows[0].stage_data) || {} });
  } catch (error) {
    console.error('Error fetching execution stages:', error);
    res.status(500).json({ error: 'Failed to fetch execution stages' });
  }
});

// Save execution stages
router.post('/execution-stages', authenticateToken, async (req, res) => {
  try {
    const { stages } = req.body;
    const result = await pool.query(
      `INSERT INTO trading_execution_stages (user_id, stage_data)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET stage_data = $2, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.user.userId, JSON.stringify(stages)]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving execution stages:', error);
    res.status(500).json({ error: 'Failed to save execution stages' });
  }
});

// ===== PSYCHOLOGY =====
// Get psychology entries
router.get('/psychology', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM trading_psychology WHERE user_id = $1 ORDER BY date DESC LIMIT 50',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching psychology entries:', error);
    res.status(500).json({ error: 'Failed to fetch psychology entries' });
  }
});

// Create psychology entry
router.post('/psychology', authenticateToken, async (req, res) => {
  try {
    const { state, notes } = req.body;
    const result = await pool.query(
      `INSERT INTO trading_psychology (user_id, state, notes)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user.userId, state, notes || null]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating psychology entry:', error);
    res.status(500).json({ error: 'Failed to create psychology entry' });
  }
});

// ===== WATCHLIST =====
// Get watchlist
router.get('/watchlist', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT symbols FROM trading_watchlist WHERE user_id = $1',
      [req.user.userId]
    );
    res.json({ symbols: (result.rows[0] && result.rows[0].symbols) || [] });
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

// Save watchlist
router.post('/watchlist', authenticateToken, async (req, res) => {
  try {
    const { symbols } = req.body;
    const result = await pool.query(
      `INSERT INTO trading_watchlist (user_id, symbols)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET symbols = $2, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.user.userId, symbols]
    );
    res.json({ success: true, symbols: result.rows[0].symbols });
  } catch (error) {
    console.error('Error saving watchlist:', error);
    res.status(500).json({ error: 'Failed to save watchlist' });
  }
});

// ===== DAILY NOTES =====
// Get all daily notes
router.get('/daily-notes', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM trading_daily_notes WHERE user_id = $1 ORDER BY date DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching daily notes:', error);
    res.status(500).json({ error: 'Failed to fetch daily notes' });
  }
});

// Get daily note by date
router.get('/daily-notes/:date', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM trading_daily_notes WHERE user_id = $1 AND date = $2',
      [req.user.userId, req.params.date]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Daily note not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching daily note:', error);
    res.status(500).json({ error: 'Failed to fetch daily note' });
  }
});

// Create or update daily note
router.post('/daily-notes', authenticateToken, async (req, res) => {
  try {
    const { date, notes } = req.body;
    
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const result = await pool.query(
      `INSERT INTO trading_daily_notes (user_id, date, notes)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, date)
       DO UPDATE SET notes = $3, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [req.user.userId, date, notes || '']
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error saving daily note:', error);
    res.status(500).json({ error: 'Failed to save daily note' });
  }
});

// Delete daily note
router.delete('/daily-notes/:date', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM trading_daily_notes WHERE user_id = $1 AND date = $2 RETURNING *',
      [req.user.userId, req.params.date]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Daily note not found' });
    }
    
    res.json({ message: 'Daily note deleted successfully' });
  } catch (error) {
    console.error('Error deleting daily note:', error);
    res.status(500).json({ error: 'Failed to delete daily note' });
  }
});

module.exports = router;
