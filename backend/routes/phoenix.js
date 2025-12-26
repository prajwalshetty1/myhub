// Phoenix Planner Routes
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get schedule
router.get('/schedule', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM phoenix_schedule WHERE user_id = $1 ORDER BY time',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// Add schedule item
router.post('/schedule', authenticateToken, async (req, res) => {
  try {
    const { time, title, category, duration } = req.body;
    const result = await pool.query(
      'INSERT INTO phoenix_schedule (user_id, time, title, category, duration) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.userId, time, title, category, duration]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding schedule item:', error);
    res.status(500).json({ error: 'Failed to add schedule item' });
  }
});

// Delete schedule item
router.delete('/schedule/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM phoenix_schedule WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting schedule item:', error);
    res.status(500).json({ error: 'Failed to delete schedule item' });
  }
});

// Get selected tasks for date
router.get('/selected-tasks/:date', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT task_data FROM phoenix_selected_tasks WHERE user_id = $1 AND date = $2',
      [req.user.userId, req.params.date]
    );
    res.json(result.rows[0]?.task_data || []);
  } catch (error) {
    console.error('Error fetching selected tasks:', error);
    res.status(500).json({ error: 'Failed to fetch selected tasks' });
  }
});

// Save selected tasks
router.post('/selected-tasks/:date', authenticateToken, async (req, res) => {
  try {
    const { tasks } = req.body;
    await pool.query(
      `INSERT INTO phoenix_selected_tasks (user_id, date, task_data)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, date) DO UPDATE SET task_data = $3`,
      [req.user.userId, req.params.date, JSON.stringify(tasks)]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving selected tasks:', error);
    res.status(500).json({ error: 'Failed to save selected tasks' });
  }
});

// Get completed tasks
router.get('/completed-tasks/:date', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT task_titles FROM phoenix_completed_tasks WHERE user_id = $1 AND date = $2',
      [req.user.userId, req.params.date]
    );
    res.json(result.rows[0]?.task_titles || []);
  } catch (error) {
    console.error('Error fetching completed tasks:', error);
    res.status(500).json({ error: 'Failed to fetch completed tasks' });
  }
});

// Save completed tasks
router.post('/completed-tasks/:date', authenticateToken, async (req, res) => {
  try {
    const { taskTitles } = req.body;
    await pool.query(
      `INSERT INTO phoenix_completed_tasks (user_id, date, task_titles)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, date) DO UPDATE SET task_titles = $3`,
      [req.user.userId, req.params.date, taskTitles]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving completed tasks:', error);
    res.status(500).json({ error: 'Failed to save completed tasks' });
  }
});

// Get supplements
router.get('/supplements', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT supplement_data FROM phoenix_supplements WHERE user_id = $1',
      [req.user.userId]
    );
    res.json(result.rows[0]?.supplement_data || { morning: [], afternoon: [], evening: [] });
  } catch (error) {
    console.error('Error fetching supplements:', error);
    res.status(500).json({ error: 'Failed to fetch supplements' });
  }
});

// Save supplements
router.post('/supplements', authenticateToken, async (req, res) => {
  try {
    const { supplements } = req.body;
    await pool.query(
      `INSERT INTO phoenix_supplements (user_id, supplement_data)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET supplement_data = $2, updated_at = CURRENT_TIMESTAMP`,
      [req.user.userId, JSON.stringify(supplements)]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving supplements:', error);
    res.status(500).json({ error: 'Failed to save supplements' });
  }
});

// Get supplements taken
router.get('/supplements-taken/:date', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT supplements_taken FROM phoenix_supplements_taken WHERE user_id = $1 AND date = $2',
      [req.user.userId, req.params.date]
    );
    res.json(result.rows[0]?.supplements_taken || {});
  } catch (error) {
    console.error('Error fetching supplements taken:', error);
    res.status(500).json({ error: 'Failed to fetch supplements taken' });
  }
});

// Save supplements taken
router.post('/supplements-taken/:date', authenticateToken, async (req, res) => {
  try {
    const { supplementsTaken } = req.body;
    await pool.query(
      `INSERT INTO phoenix_supplements_taken (user_id, date, supplements_taken)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, date) DO UPDATE SET supplements_taken = $3`,
      [req.user.userId, req.params.date, JSON.stringify(supplementsTaken)]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving supplements taken:', error);
    res.status(500).json({ error: 'Failed to save supplements taken' });
  }
});

module.exports = router;

