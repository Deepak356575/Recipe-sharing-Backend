const express = require('express');
const { createRecipe, getRecipes, getRecipeById, updateRecipe, deleteRecipe, getUserRecipes, addRating, 
    addComment, getAverageRating, addVideoTutorial, searchRecipes   } = require('../controllers/recipeController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

// Get user-specific recipes (protected)
router.get('/user-recipes', protect, getUserRecipes);

// Create a recipe (protected)
router.post('/', protect, createRecipe);

// Get all recipes
router.get('/', getRecipes);

router.get('/search', searchRecipes);

// Get a recipe by ID
router.get('/:id', getRecipeById);

// Update a recipe (protected)
router.put('/:id', protect, updateRecipe);

// Delete a recipe (protected)
router.delete('/:id', protect, deleteRecipe);

// Add a rating to a recipe (protected)
router.post('/:id/rating', protect, addRating);

// Add a comment to a recipe (protected)
router.post('/:id/comment', protect, addComment);

// Get average rating of a recipe
router.get('/:id/average-rating', getAverageRating);

// Add or Update Video Tutorial for a Recipe (protected)
router.post('/:id/video', protect, addVideoTutorial);




module.exports = router;
