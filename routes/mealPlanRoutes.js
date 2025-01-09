const express = require('express');
const { createMealPlan, getMealPlan, deleteMealPlan } = require('../controllers/mealPlanController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

// Create or update meal plan
router.post('/meal-plan', protect, createMealPlan);

// Get meal plan
router.get('/meal-plan', protect, getMealPlan);

// Delete meal plan
router.delete('/meal-plan', protect, deleteMealPlan);


module.exports = router;
