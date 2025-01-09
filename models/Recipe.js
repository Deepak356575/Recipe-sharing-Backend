const mongoose = require('mongoose');

const recipeSchema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        ingredients: {
            type: [String],
            required: true,
        },
        preparationSteps: {
            type: [String],
            required: true,
        },
        cookingTime: {
            type: String,
            required: true,
        },
        servings: {
            type: Number,
            required: true,
        },
        photo: {
            type: String,
        },
        videoTutorial: {
            type: String,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        ratings: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                rating: {
                    type: Number,
                    required: true,
                    min: 1,
                    max: 5,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        comments: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                content: {
                    type: String,
                    required: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
