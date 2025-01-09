const mongoose = require('mongoose');

const mealPlanSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    weekPlan: [
      {
        day: String, // e.g., Monday, Tuesday, etc.
        recipes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Recipe',
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

module.exports = MealPlan;
