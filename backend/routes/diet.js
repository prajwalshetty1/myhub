// Diet Planner Routes
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get meals for date
router.get('/meals/:date', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT meal_type, meal_data FROM diet_meals WHERE user_id = $1 AND date = $2',
      [req.user.userId, req.params.date]
    );
    
    const meals = { protein: [], one: [] };
    result.rows.forEach(row => {
      meals[row.meal_type] = row.meal_data;
    });
    
    res.json(meals);
  } catch (error) {
    console.error('Error fetching meals:', error);
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

// Save meals
router.post('/meals/:date', authenticateToken, async (req, res) => {
  try {
    const { mealType, meals } = req.body;
    await pool.query(
      `INSERT INTO diet_meals (user_id, date, meal_type, meal_data)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, date, meal_type) DO UPDATE SET meal_data = $4`,
      [req.user.userId, req.params.date, mealType, JSON.stringify(meals)]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving meals:', error);
    res.status(500).json({ error: 'Failed to save meals' });
  }
});

// Get goals
router.get('/goals', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT goals_data FROM diet_goals WHERE user_id = $1',
      [req.user.userId]
    );
    res.json(result.rows[0]?.goals_data || { calories: 2000, protein: 150, carbs: 200, fat: 65 });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// Save goals
router.post('/goals', authenticateToken, async (req, res) => {
  try {
    const { goals } = req.body;
    await pool.query(
      `INSERT INTO diet_goals (user_id, goals_data)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET goals_data = $2, updated_at = CURRENT_TIMESTAMP`,
      [req.user.userId, JSON.stringify(goals)]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving goals:', error);
    res.status(500).json({ error: 'Failed to save goals' });
  }
});

// Get water for date
router.get('/water/:date', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT glasses FROM diet_water WHERE user_id = $1 AND date = $2',
      [req.user.userId, req.params.date]
    );
    res.json({ water: result.rows[0]?.glasses || 0 });
  } catch (error) {
    console.error('Error fetching water:', error);
    res.status(500).json({ error: 'Failed to fetch water' });
  }
});

// Save water
router.post('/water/:date', authenticateToken, async (req, res) => {
  try {
    const { water } = req.body;
    await pool.query(
      `INSERT INTO diet_water (user_id, date, glasses)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, date) DO UPDATE SET glasses = $3`,
      [req.user.userId, req.params.date, water]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving water:', error);
    res.status(500).json({ error: 'Failed to save water' });
  }
});

// Get fasting status
router.get('/fasting', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT start_time, is_fasting FROM diet_fasting WHERE user_id = $1',
      [req.user.userId]
    );
    res.json(result.rows[0] || { startTime: null, isFasting: false });
  } catch (error) {
    console.error('Error fetching fasting:', error);
    res.status(500).json({ error: 'Failed to fetch fasting status' });
  }
});

// Save fasting status
router.post('/fasting', authenticateToken, async (req, res) => {
  try {
    const { startTime, isFasting } = req.body;
    await pool.query(
      `INSERT INTO diet_fasting (user_id, start_time, is_fasting)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE SET start_time = $2, is_fasting = $3, updated_at = CURRENT_TIMESTAMP`,
      [req.user.userId, startTime, isFasting]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving fasting:', error);
    res.status(500).json({ error: 'Failed to save fasting status' });
  }
});

module.exports = router;

