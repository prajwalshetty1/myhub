// Phoenix Planner Routes
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
// Get schedule
router.get('/schedule', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM phoenix_schedule ORDER BY time',
      [null]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// Add schedule item
router.post('/schedule', async (req, res) => {
  try {
    const { time, title, category, duration } = req.body;
    const result = await pool.query(
      'INSERT INTO phoenix_schedule (time, title, category, duration) VALUES ($1, $2, $3, $4) RETURNING *',
      [null, time, title, category, duration]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error adding schedule item:', error);
    res.status(500).json({ error: 'Failed to add schedule item' });
  }
});

// Delete schedule item
router.delete('/schedule/:id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM phoenix_schedule WHERE id = $1 ',
      [req.params.id, null]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting schedule item:', error);
    res.status(500).json({ error: 'Failed to delete schedule item' });
  }
});

// Get selected tasks for date
router.get('/selected-tasks/:date', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT task_data FROM phoenix_selected_tasks AND date = $1',
      [null, req.params.date]
    );
    res.json((result.rows[0] && result.rows[0].task_data) || []);
  } catch (error) {
    console.error('Error fetching selected tasks:', error);
    res.status(500).json({ error: 'Failed to fetch selected tasks' });
  }
});

// Save selected tasks
router.post('/selected-tasks/:date', async (req, res) => {
  try {
    const { tasks } = req.body;
    await pool.query(
      `INSERT INTO phoenix_selected_tasks (date, task_data)
       VALUES ($1, $2)
       ON CONFLICT (date) DO UPDATE SET task_data = $2`,
      [null, req.params.date, JSON.stringify(tasks)]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving selected tasks:', error);
    res.status(500).json({ error: 'Failed to save selected tasks' });
  }
});

// Get completed tasks
router.get('/completed-tasks/:date', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT task_titles FROM phoenix_completed_tasks AND date = $1',
      [null, req.params.date]
    );
    res.json((result.rows[0] && result.rows[0].task_titles) || []);
  } catch (error) {
    console.error('Error fetching completed tasks:', error);
    res.status(500).json({ error: 'Failed to fetch completed tasks' });
  }
});

// Save completed tasks
router.post('/completed-tasks/:date', async (req, res) => {
  try {
    const { taskTitles } = req.body;
    await pool.query(
      `INSERT INTO phoenix_completed_tasks (date, task_titles)
       VALUES ($1, $2)
       ON CONFLICT (date) DO UPDATE SET task_titles = $2`,
      [null, req.params.date, taskTitles]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving completed tasks:', error);
    res.status(500).json({ error: 'Failed to save completed tasks' });
  }
});

// Get supplements
router.get('/supplements', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT supplement_data FROM phoenix_supplements',
      [null]
    );
    res.json((result.rows[0] && result.rows[0].supplement_data) || { morning: [], afternoon: [], evening: [] });
  } catch (error) {
    console.error('Error fetching supplements:', error);
    res.status(500).json({ error: 'Failed to fetch supplements' });
  }
});

// Save supplements
router.post('/supplements', async (req, res) => {
  try {
    const { supplements } = req.body;
    await pool.query(
      `INSERT INTO phoenix_supplements (supplement_data)
       VALUES ($1)
       ON CONFLICT () DO UPDATE SET supplement_data = $1, updated_at = CURRENT_TIMESTAMP`,
      [null, JSON.stringify(supplements)]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving supplements:', error);
    res.status(500).json({ error: 'Failed to save supplements' });
  }
});

// Get supplements taken
router.get('/supplements-taken/:date', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT supplements_taken FROM phoenix_supplements_taken AND date = $1',
      [null, req.params.date]
    );
    res.json((result.rows[0] && result.rows[0].supplements_taken) || {});
  } catch (error) {
    console.error('Error fetching supplements taken:', error);
    res.status(500).json({ error: 'Failed to fetch supplements taken' });
  }
});

// Save supplements taken
router.post('/supplements-taken/:date', async (req, res) => {
  try {
    const { supplementsTaken } = req.body;
    await pool.query(
      `INSERT INTO phoenix_supplements_taken (date, supplements_taken)
       VALUES ($1, $2)
       ON CONFLICT (date) DO UPDATE SET supplements_taken = $2`,
      [null, req.params.date, JSON.stringify(supplementsTaken)]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving supplements taken:', error);
    res.status(500).json({ error: 'Failed to save supplements taken' });
  }
});

module.exports = router;

