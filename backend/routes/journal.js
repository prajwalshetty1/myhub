// Journal Routes - Unauthenticated
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all journal entries
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM journal_entries WHERE user_id IS NULL ORDER BY date DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

// Get journal entry by date
router.get('/date/:date', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM journal_entries WHERE user_id IS NULL AND date = $1',
      [req.params.date]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    res.status(500).json({ error: 'Failed to fetch journal entry' });
  }
});

// Create or update journal entry
router.post('/', async (req, res) => {
  try {
    const { date, title, content, mood, tags } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const result = await pool.query(
      `INSERT INTO journal_entries (user_id, date, title, content, mood, tags)
       VALUES (NULL, $1, $2, $3, $4, $5)
       ON CONFLICT (user_id, date)
       DO UPDATE SET 
         title = $2,
         content = $3,
         mood = $4,
         tags = $5,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [date, title || '', content || '', mood || null, tags || []]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error saving journal entry:', error);
    res.status(500).json({ error: 'Failed to save journal entry' });
  }
});

// Delete journal entry
router.delete('/:date', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM journal_entries WHERE user_id IS NULL AND date = $1 RETURNING *',
      [req.params.date]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    res.json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
});

module.exports = router;

