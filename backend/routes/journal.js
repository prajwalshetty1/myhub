// Enhanced Journal Routes - Advanced Features
const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all journal entries with filtering and search
router.get('/', async (req, res) => {
  try {
    const { search, category, mood, favorite, month, year } = req.query;
    
    let query = 'SELECT * FROM journal_entries WHERE user_id IS NULL';
    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND search_vector @@ plainto_tsquery('english', $${paramCount})`;
      params.push(search);
      paramCount++;
    }

    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (mood) {
      query += ` AND mood = $${paramCount}`;
      params.push(mood);
      paramCount++;
    }

    if (favorite === 'true') {
      query += ` AND is_favorite = TRUE`;
    }

    if (month && year) {
      query += ` AND EXTRACT(MONTH FROM date) = $${paramCount} AND EXTRACT(YEAR FROM date) = $${paramCount + 1}`;
      params.push(month, year);
      paramCount += 2;
    }

    query += ' ORDER BY date DESC';

    const result = await pool.query(query, params);
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
    const { date, title, content, mood, tags, category, is_favorite, weather, location, images, voice_notes } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    // Calculate word count
    const word_count = content ? content.trim().split(/\s+/).filter(w => w.length > 0).length : 0;

    // Simple sentiment analysis (basic)
    const sentiment = analyzeSentiment(content || '');

    const result = await pool.query(
      `INSERT INTO journal_entries (
        user_id, date, title, content, mood, tags, category, 
        is_favorite, word_count, weather, location, images, voice_notes, sentiment
      )
       VALUES (NULL, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (user_id, date)
       DO UPDATE SET 
         title = $2,
         content = $3,
         mood = $4,
         tags = $5,
         category = $6,
         is_favorite = $7,
         word_count = $8,
         weather = $9,
         location = $10,
         images = $11,
         voice_notes = $12,
         sentiment = $13,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [
        date, 
        title || '', 
        content || '', 
        mood || null, 
        tags || [], 
        category || null,
        is_favorite || false,
        word_count,
        weather || null,
        location || null,
        images || [],
        voice_notes || [],
        sentiment
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error saving journal entry:', error);
    res.status(500).json({ error: 'Failed to save journal entry' });
  }
});

// Toggle favorite
router.patch('/:date/favorite', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE journal_entries 
       SET is_favorite = NOT is_favorite, updated_at = CURRENT_TIMESTAMP
       WHERE user_id IS NULL AND date = $1
       RETURNING *`,
      [req.params.date]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

// Get analytics
router.get('/analytics/stats', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_entries,
        SUM(word_count) as total_words,
        AVG(word_count) as avg_words_per_entry,
        COUNT(DISTINCT category) as categories_count,
        COUNT(CASE WHEN is_favorite THEN 1 END) as favorite_count,
        mode() WITHIN GROUP (ORDER BY mood) as most_common_mood,
        COUNT(DISTINCT DATE_TRUNC('month', date)) as months_active
      FROM journal_entries 
      WHERE user_id IS NULL
    `);

    // Get mood distribution
    const moodDist = await pool.query(`
      SELECT mood, COUNT(*) as count
      FROM journal_entries
      WHERE user_id IS NULL AND mood IS NOT NULL
      GROUP BY mood
      ORDER BY count DESC
    `);

    // Get category distribution
    const categoryDist = await pool.query(`
      SELECT category, COUNT(*) as count
      FROM journal_entries
      WHERE user_id IS NULL AND category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
      LIMIT 10
    `);

    // Get monthly stats
    const monthlyStats = await pool.query(`
      SELECT 
        DATE_TRUNC('month', date) as month,
        COUNT(*) as entries,
        SUM(word_count) as words
      FROM journal_entries
      WHERE user_id IS NULL
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `);

    res.json({
      overall: result.rows[0],
      mood_distribution: moodDist.rows,
      category_distribution: categoryDist.rows,
      monthly_stats: monthlyStats.rows
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get tags cloud
router.get('/tags', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT tag, COUNT(*) as count
      FROM journal_entries, unnest(tags) as tag
      WHERE user_id IS NULL
      GROUP BY tag
      ORDER BY count DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Export entries
router.get('/export', async (req, res) => {
  try {
    const { format = 'json', start_date, end_date } = req.query;
    
    let query = 'SELECT * FROM journal_entries WHERE user_id IS NULL';
    const params = [];
    
    if (start_date && end_date) {
      query += ' AND date BETWEEN $1 AND $2';
      params.push(start_date, end_date);
    }
    
    query += ' ORDER BY date ASC';
    
    const result = await pool.query(query, params);
    
    if (format === 'markdown') {
      const markdown = result.rows.map(entry => {
        return `# ${entry.title || 'Untitled'}\n\n**Date:** ${entry.date}\n**Mood:** ${entry.mood || 'N/A'}\n\n${entry.content}\n\n---\n\n`;
      }).join('');
      
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', 'attachment; filename="journal_export.md"');
      res.send(markdown);
    } else {
      res.json(result.rows);
    }
  } catch (error) {
    console.error('Error exporting entries:', error);
    res.status(500).json({ error: 'Failed to export entries' });
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

// Simple sentiment analysis helper
function analyzeSentiment(text) {
  const positive = ['happy', 'great', 'amazing', 'wonderful', 'excellent', 'love', 'joy', 'excited', 'grateful', 'blessed'];
  const negative = ['sad', 'bad', 'terrible', 'awful', 'hate', 'angry', 'frustrated', 'disappointed', 'depressed'];
  
  const lowerText = text.toLowerCase();
  const positiveCount = positive.filter(word => lowerText.includes(word)).length;
  const negativeCount = negative.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

module.exports = router;
