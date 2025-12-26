// Hub Routes (habits, intentions, gamification, activity log)
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get habits
router.get('/habits', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT habits_data FROM hub_habits WHERE user_id = $1',
      [req.user.userId]
    );
    res.json(result.rows[0]?.habits_data || []);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
});

// Save habits
router.post('/habits', authenticateToken, async (req, res) => {
  try {
    const { habits } = req.body;
    await pool.query(
      `INSERT INTO hub_habits (user_id, habits_data)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET habits_data = $2, updated_at = CURRENT_TIMESTAMP`,
      [req.user.userId, JSON.stringify(habits)]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving habits:', error);
    res.status(500).json({ error: 'Failed to save habits' });
  }
});

// Get habit logs for date
router.get('/habit-logs/:date', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT habit_logs FROM hub_habit_logs WHERE user_id = $1 AND date = $2',
      [req.user.userId, req.params.date]
    );
    res.json(result.rows[0]?.habit_logs || {});
  } catch (error) {
    console.error('Error fetching habit logs:', error);
    res.status(500).json({ error: 'Failed to fetch habit logs' });
  }
});

// Save habit logs
router.post('/habit-logs/:date', authenticateToken, async (req, res) => {
  try {
    const { habitLogs } = req.body;
    await pool.query(
      `INSERT INTO hub_habit_logs (user_id, date, habit_logs)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, date) DO UPDATE SET habit_logs = $3`,
      [req.user.userId, req.params.date, JSON.stringify(habitLogs)]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving habit logs:', error);
    res.status(500).json({ error: 'Failed to save habit logs' });
  }
});

// Get intentions for date
router.get('/intentions/:date', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT intentions_data FROM hub_intentions WHERE user_id = $1 AND date = $2',
      [req.user.userId, req.params.date]
    );
    res.json(result.rows[0]?.intentions_data || {});
  } catch (error) {
    console.error('Error fetching intentions:', error);
    res.status(500).json({ error: 'Failed to fetch intentions' });
  }
});

// Save intentions
router.post('/intentions/:date', authenticateToken, async (req, res) => {
  try {
    const { intentions } = req.body;
    await pool.query(
      `INSERT INTO hub_intentions (user_id, date, intentions_data)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, date) DO UPDATE SET intentions_data = $3`,
      [req.user.userId, req.params.date, JSON.stringify(intentions)]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving intentions:', error);
    res.status(500).json({ error: 'Failed to save intentions' });
  }
});

// Get gamification data
router.get('/gamification', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT total_xp, weekly_xp, level, achievements, streaks FROM hub_gamification WHERE user_id = $1',
      [req.user.userId]
    );
    if (result.rows.length === 0) {
      // Create default gamification entry
      await pool.query(
        'INSERT INTO hub_gamification (user_id) VALUES ($1)',
        [req.user.userId]
      );
      return res.json({ totalXP: 0, weeklyXP: 0, level: 1, achievements: [], streaks: {} });
    }
    const row = result.rows[0];
    res.json({
      totalXP: row.total_xp,
      weeklyXP: row.weekly_xp,
      level: row.level,
      achievements: row.achievements || [],
      streaks: row.streaks || {}
    });
  } catch (error) {
    console.error('Error fetching gamification:', error);
    res.status(500).json({ error: 'Failed to fetch gamification' });
  }
});

// Update gamification
router.post('/gamification', authenticateToken, async (req, res) => {
  try {
    const { totalXP, weeklyXP, level, achievements, streaks } = req.body;
    await pool.query(
      `INSERT INTO hub_gamification (user_id, total_xp, weekly_xp, level, achievements, streaks)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO UPDATE SET
         total_xp = $2, weekly_xp = $3, level = $4, achievements = $5, streaks = $6, updated_at = CURRENT_TIMESTAMP`,
      [req.user.userId, totalXP, weeklyXP, level, JSON.stringify(achievements), JSON.stringify(streaks)]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving gamification:', error);
    res.status(500).json({ error: 'Failed to save gamification' });
  }
});

// Get activity log
router.get('/activity-log', authenticateToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const result = await pool.query(
      `SELECT timestamp, action, details FROM hub_activity_log
       WHERE user_id = $1
       ORDER BY timestamp DESC
       LIMIT $2`,
      [req.user.userId, limit]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching activity log:', error);
    res.status(500).json({ error: 'Failed to fetch activity log' });
  }
});

// Log activity
router.post('/activity-log', authenticateToken, async (req, res) => {
  try {
    const { action, details } = req.body;
    await pool.query(
      'INSERT INTO hub_activity_log (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.userId, action, JSON.stringify(details || {})]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

module.exports = router;

