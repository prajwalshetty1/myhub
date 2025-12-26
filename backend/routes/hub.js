// Hub Routes (habits, intentions, gamification, activity log)
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
// Get habits
router.get('/habits', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT habits_data FROM hub_habits',
      [null]
    );
    res.json((result.rows[0] && result.rows[0].habits_data) || []);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
});

// Save habits
router.post('/habits', async (req, res) => {
  try {
    const { habits } = req.body;
    await pool.query(
      `INSERT INTO hub_habits (habits_data)
       VALUES ($1)
       ON CONFLICT () DO UPDATE SET habits_data = $1, updated_at = CURRENT_TIMESTAMP`,
      [null, JSON.stringify(habits)]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving habits:', error);
    res.status(500).json({ error: 'Failed to save habits' });
  }
});

// Get habit logs for date
router.get('/habit-logs/:date', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT habit_logs FROM hub_habit_logs AND date = $1',
      [null, req.params.date]
    );
    res.json((result.rows[0] && result.rows[0].habit_logs) || {});
  } catch (error) {
    console.error('Error fetching habit logs:', error);
    res.status(500).json({ error: 'Failed to fetch habit logs' });
  }
});

// Save habit logs
router.post('/habit-logs/:date', async (req, res) => {
  try {
    const { habitLogs } = req.body;
    await pool.query(
      `INSERT INTO hub_habit_logs (date, habit_logs)
       VALUES ($1, $2)
       ON CONFLICT (date) DO UPDATE SET habit_logs = $2`,
      [null, req.params.date, JSON.stringify(habitLogs)]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving habit logs:', error);
    res.status(500).json({ error: 'Failed to save habit logs' });
  }
});

// Get intentions for date
router.get('/intentions/:date', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT intentions_data FROM hub_intentions AND date = $1',
      [null, req.params.date]
    );
    res.json((result.rows[0] && result.rows[0].intentions_data) || {});
  } catch (error) {
    console.error('Error fetching intentions:', error);
    res.status(500).json({ error: 'Failed to fetch intentions' });
  }
});

// Save intentions
router.post('/intentions/:date', async (req, res) => {
  try {
    const { intentions } = req.body;
    await pool.query(
      `INSERT INTO hub_intentions (date, intentions_data)
       VALUES ($1, $2)
       ON CONFLICT (date) DO UPDATE SET intentions_data = $2`,
      [null, req.params.date, JSON.stringify(intentions)]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving intentions:', error);
    res.status(500).json({ error: 'Failed to save intentions' });
  }
});

// Get gamification data
router.get('/gamification', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT total_xp, weekly_xp, level, achievements, streaks FROM hub_gamification',
      [null]
    );
    if (result.rows.length === 0) {
      // Create default gamification entry
      await pool.query(
        'INSERT INTO hub_gamification () VALUES ($1)',
        [null]
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
router.post('/gamification', async (req, res) => {
  try {
    const { totalXP, weeklyXP, level, achievements, streaks } = req.body;
    await pool.query(
      `INSERT INTO hub_gamification (total_xp, weekly_xp, level, achievements, streaks)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT () DO UPDATE SET
         total_xp = $1, weekly_xp = $2, level = $3, achievements = $4, streaks = $5, updated_at = CURRENT_TIMESTAMP`,
      [null, totalXP, weeklyXP, level, JSON.stringify(achievements), JSON.stringify(streaks)]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving gamification:', error);
    res.status(500).json({ error: 'Failed to save gamification' });
  }
});

// Get activity log
router.get('/activity-log', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const result = await pool.query(
      `SELECT timestamp, action, details FROM hub_activity_log
       ORDER BY timestamp DESC
       LIMIT $1`,
      [null, limit]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching activity log:', error);
    res.status(500).json({ error: 'Failed to fetch activity log' });
  }
});

// Log activity
router.post('/activity-log', async (req, res) => {
  try {
    const { action, details } = req.body;
    await pool.query(
      'INSERT INTO hub_activity_log (action, details) VALUES ($1, $2)',
      [null, action, JSON.stringify(details || {})]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

module.exports = router;

