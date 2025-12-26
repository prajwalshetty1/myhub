// Diet Planner Routes
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
// Get meals for date
router.get('/meals/:date', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT meal_type, meal_data FROM diet_meals AND date = $1',
      [null, req.params.date]
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
router.post('/meals/:date', async (req, res) => {
  try {
    const { mealType, meals } = req.body;
    await pool.query(
      `INSERT INTO diet_meals (date, meal_type, meal_data)
       VALUES ($1, $2, $3)
       ON CONFLICT (date, meal_type) DO UPDATE SET meal_data = $3`,
      [null, req.params.date, mealType, JSON.stringify(meals)]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving meals:', error);
    res.status(500).json({ error: 'Failed to save meals' });
  }
});

// Get goals
router.get('/goals', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT goals_data FROM diet_goals',
      [null]
    );
    res.json((result.rows[0] && result.rows[0].goals_data) || { calories: 2000, protein: 150, carbs: 200, fat: 65 });
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// Save goals
router.post('/goals', async (req, res) => {
  try {
    const { goals } = req.body;
    await pool.query(
      `INSERT INTO diet_goals (goals_data)
       VALUES ($1)
       ON CONFLICT () DO UPDATE SET goals_data = $1, updated_at = CURRENT_TIMESTAMP`,
      [null, JSON.stringify(goals)]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving goals:', error);
    res.status(500).json({ error: 'Failed to save goals' });
  }
});

// Get water for date
router.get('/water/:date', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT glasses FROM diet_water AND date = $1',
      [null, req.params.date]
    );
    res.json({ water: (result.rows[0] && result.rows[0].glasses) || 0 });
  } catch (error) {
    console.error('Error fetching water:', error);
    res.status(500).json({ error: 'Failed to fetch water' });
  }
});

// Save water
router.post('/water/:date', async (req, res) => {
  try {
    const { water } = req.body;
    await pool.query(
      `INSERT INTO diet_water (date, glasses)
       VALUES ($1, $2)
       ON CONFLICT (date) DO UPDATE SET glasses = $2`,
      [null, req.params.date, water]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving water:', error);
    res.status(500).json({ error: 'Failed to save water' });
  }
});

// Get fasting status
router.get('/fasting', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT start_time, is_fasting FROM diet_fasting',
      [null]
    );
    res.json(result.rows[0] || { startTime: null, isFasting: false });
  } catch (error) {
    console.error('Error fetching fasting:', error);
    res.status(500).json({ error: 'Failed to fetch fasting status' });
  }
});

// Save fasting status
router.post('/fasting', async (req, res) => {
  try {
    const { startTime, isFasting } = req.body;
    await pool.query(
      `INSERT INTO diet_fasting (start_time, is_fasting)
       VALUES ($1, $2)
       ON CONFLICT () DO UPDATE SET start_time = $1, is_fasting = $2, updated_at = CURRENT_TIMESTAMP`,
      [null, startTime, isFasting]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving fasting:', error);
    res.status(500).json({ error: 'Failed to save fasting status' });
  }
});

module.exports = router;

