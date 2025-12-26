// Learning 2026 Routes
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get all topics
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM learning_topics WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

// Get topic by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM learning_topics WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching topic:', error);
    res.status(500).json({ error: 'Failed to fetch topic' });
  }
});

// Create topic
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, category, priority, targetHours, resources } = req.body;
    const result = await pool.query(
      `INSERT INTO learning_topics (user_id, name, category, priority, target_hours, resources)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user.userId, name, category, priority, targetHours || 10, resources]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({ error: 'Failed to create topic' });
  }
});

// Update topic
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, category, priority, targetHours, resources, hoursLogged, completed } = req.body;
    const result = await pool.query(
      `UPDATE learning_topics
       SET name = $1, category = $2, priority = $3, target_hours = $4, resources = $5,
           hours_logged = COALESCE($6, hours_logged), completed = COALESCE($7, completed), updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [name, category, priority, targetHours, resources, hoursLogged, completed, req.params.id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating topic:', error);
    res.status(500).json({ error: 'Failed to update topic' });
  }
});

// Delete topic
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM learning_topics WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting topic:', error);
    res.status(500).json({ error: 'Failed to delete topic' });
  }
});

// Log hours
router.post('/:id/hours', authenticateToken, async (req, res) => {
  try {
    const { hours } = req.body;
    const result = await pool.query(
      `UPDATE learning_topics
       SET hours_logged = hours_logged + $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [hours, req.params.id, req.user.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error logging hours:', error);
    res.status(500).json({ error: 'Failed to log hours' });
  }
});

module.exports = router;

