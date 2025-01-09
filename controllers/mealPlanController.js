const MealPlan = require('../models/MealPlan');

// Create or update meal plan
const createMealPlan = async (req, res) => {
  const { weekPlan } = req.body; // Week plan with recipes for each day

  try {
    let mealPlan = await MealPlan.findOne({ user: req.user._id });

    if (mealPlan) {
      // Update existing meal plan
      mealPlan.weekPlan = weekPlan;
    } else {
      // Create new meal plan
      mealPlan = new MealPlan({
        user: req.user._id,
        weekPlan,
      });
    }

    await mealPlan.save();
    res.status(200).json({ message: 'Meal plan saved successfully', mealPlan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get meal plan for user
const getMealPlan = async (req, res) => {
  try {
    const mealPlan = await MealPlan.findOne({ user: req.user._id });

    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }

    res.status(200).json({ mealPlan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete meal plan
const deleteMealPlan = async (req, res) => {
    try {
      const mealPlan = await MealPlan.findOneAndDelete({ user: req.user._id });
  
      if (!mealPlan) {
        return res.status(404).json({ message: 'Meal plan not found' });
      }
  
      res.status(200).json({ message: 'Meal plan deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
module.exports = { createMealPlan, getMealPlan, deleteMealPlan };
