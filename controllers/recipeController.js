const Recipe = require('../models/Recipe');

// Create Recipe
const createRecipe = async (req, res) => {
    const { title, ingredients, preparationSteps, cookingTime, servings, photo, videoTutorial } = req.body;

    try {
        const recipe = new Recipe({
            title,
            ingredients,
            preparationSteps,
            cookingTime,
            servings,
            photo,
            videoTutorial,
            user: req.user._id, // Link recipe to logged-in user
        });

        await recipe.save();

        res.status(201).json(recipe);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get All Recipes
const getRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find();
        res.status(200).json(recipes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Recipe by ID
const getRecipeById = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        res.status(200).json(recipe);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update Recipe
const updateRecipe = async (req, res) => {
    const { title, ingredients, preparationSteps, cookingTime, servings, photo, videoTutorial } = req.body;

    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Check if the logged-in user is the owner of the recipe
        if (recipe.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this recipe' });
        }

        // Update recipe fields
        recipe.title = title || recipe.title;
        recipe.ingredients = ingredients || recipe.ingredients;
        recipe.preparationSteps = preparationSteps || recipe.preparationSteps;
        recipe.cookingTime = cookingTime || recipe.cookingTime;
        recipe.servings = servings || recipe.servings;
        recipe.photo = photo || recipe.photo;
        recipe.videoTutorial = videoTutorial || recipe.videoTutorial;

        await recipe.save();

        res.status(200).json(recipe);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Recipe
const deleteRecipe = async (req, res) => {
    try {
        // Find the recipe by ID
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Check if the logged-in user is the owner of the recipe
        if (recipe.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this recipe' });
        }

        // Use findByIdAndDelete (recommended method in Mongoose 6)
        await Recipe.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Recipe removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get User's Recipes
const getUserRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.find({ user: req.user._id });

        if (!recipes || recipes.length === 0) {
            return res.status(404).json({ message: 'No recipes found for this user' });
        }

        res.status(200).json(recipes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching user recipes' });
    }
};



// Add Rating
const addRating = async (req, res) => {
    const { rating } = req.body; // Rating from 1 to 5

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Invalid rating. Must be between 1 and 5.' });
    }

    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Check if user already rated the recipe
        const existingRating = recipe.ratings.find((r) => r.user.toString() === req.user._id.toString());
        if (existingRating) {
            existingRating.rating = rating; // Update existing rating
        } else {
            // Add a new rating
            recipe.ratings.push({ user: req.user._id, rating });
        }

        await recipe.save();
        res.status(200).json({ message: 'Rating added successfully', recipe });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add Comment
const addComment = async (req, res) => {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'Comment content is required' });
    }

    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        const comment = {
            user: req.user._id,
            content,
        };

        recipe.comments.push(comment);
        await recipe.save();

        res.status(200).json({ message: 'Comment added successfully', comment });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Average Rating
const getAverageRating = async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        const ratingsCount = recipe.ratings.length;
        if (ratingsCount === 0) {
            return res.status(200).json({ message: 'No ratings yet' });
        }

        const totalRatings = recipe.ratings.reduce((acc, rating) => acc + rating.rating, 0);
        const averageRating = totalRatings / ratingsCount;

        res.status(200).json({ averageRating: averageRating.toFixed(2), ratingsCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// Add or Update Video Tutorial for a Recipe
const addVideoTutorial = async (req, res) => {
    const { videoTutorial } = req.body; // URL of the video tutorial

    if (!videoTutorial) {
        return res.status(400).json({ message: 'Video tutorial URL is required' });
    }

    try {
        const recipe = await Recipe.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }

        // Check if the user is the owner of the recipe
        if (recipe.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only add a video to your own recipe' });
        }

        // Update the video tutorial URL
        recipe.videoTutorial = videoTutorial;
        await recipe.save();

        res.status(200).json({ message: 'Video tutorial added successfully', recipe });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




// Search recipes by ingredient and filter by dietary preference
const searchRecipes = async (req, res) => {
    const { ingredient, mealType, dietaryPreference } = req.query;

    try {
        let query = {};

        // Check for ingredients query
        if (ingredient) {
            query.ingredients = { $in: ingredient.split(',').map(i => new RegExp(i, 'i')) }; // Ingredients search with case insensitivity
        }

        // Check for mealType query
        if (mealType) {
            query.mealType = mealType;
        }

        // Check for dietaryPreference query
        if (dietaryPreference) {
            query.dietaryPreference = dietaryPreference;
        }

        // Find recipes based on the constructed query
        const recipes = await Recipe.find(query);

        // Return the matching recipes
        res.status(200).json({ recipes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = { createRecipe, getRecipes, getRecipeById, updateRecipe, deleteRecipe,
     getUserRecipes,addRating, addComment, getAverageRating, addVideoTutorial, searchRecipes };
