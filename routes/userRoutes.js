const express = require('express');
const { registerUser, loginUser, updateProfile, getProfile, followUser, unfollowUser, addToFavorites   } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Example of a protected route
router.get('/profile', protect, (req, res) => {
    res.status(200).json({
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        bio: req.user.bio,
        profilePicture: req.user.profilePicture,
    });
});

router.post('/logout', (req, res) => {
    res.clearCookie('token'); // Clear the token cookie
    res.status(200).json({ message: 'Logged out successfully' });
});


// Update user profile
router.put('/profile', protect, updateProfile);

// Get user profile
router.get('/profile', protect, getProfile);

// Follow a user
router.post('/follow', protect, followUser);

// Unfollow a user
router.post('/unfollow', protect, unfollowUser);

router.put('/favorites', protect, addToFavorites);



module.exports = router;
