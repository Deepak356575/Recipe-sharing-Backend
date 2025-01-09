const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors'); // Add this - you'll need to install it
const userRoutes = require('./routes/userRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const mealPlanRoutes = require('./routes/mealPlanRoutes');
require('dotenv').config();

const app = express();

// CORS Configuration
app.use(cors({
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true, // Allow credentials (cookies)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api', mealPlanRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!', 
        error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
});

// Handle 404 routes
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// MongoDB connection with better error handling
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully');
        
        // Start server only after successful database connection
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log('Environment:', process.env.NODE_ENV || 'development');
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit process with failure
    });

const PORT = process.env.PORT || 5001;

// Verify environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET_KEY'];
requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`Error: Environment variable ${varName} is not set`);
        process.exit(1);
    }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    // Close server & exit process
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Close server & exit process
    process.exit(1);
});

// Only log JWT secret in development
if (process.env.NODE_ENV === 'development') {
    console.log('JWT Secret Key:', process.env.JWT_SECRET_KEY);
}
