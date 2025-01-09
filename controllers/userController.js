const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Recipe = require('../models/Recipe');

// Generate JWT Token
const generateToken = (id) => {
    const secretKey = process.env.JWT_SECRET_KEY;  // Ensure JWT_SECRET_KEY is read inside the function

    if (!secretKey) {
        return res.status(500).json({ message: "JWT_SECRET_KEY is not defined in the .env file" });
    }

    return jwt.sign({ id }, secretKey, { expiresIn: '30d' });
};

// User Registration


const registerUser = async (req, res) => {
    try {
        console.log('Registration request body:', req.body); // Debug log

        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            console.log('Missing required fields:', { name, email, password }); // Debug log
            return res.status(400).json({ 
                message: 'Please provide all required fields',
                missing: {
                    name: !name,
                    email: !email,
                    password: !password
                }
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Create user
        const user = new User({
            name,
            email,
            password
        });

        await user.save();

        // Generate token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '30d' }
        );

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        // Send response
        res.status(201).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Registration error:', error); // Debug log
        res.status(500).json({
            message: 'Registration failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};




// User Login
// controllers/userController.js
const loginUser = async (req, res) => {
  try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
          return res.status(400).json({ message: 'Please provide email and password' });
      }

      // Find user
      const user = await User.findOne({ email });
      
      if (!user) {
          return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check password
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
          return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate token
      const token = jwt.sign(
          { id: user._id },
          process.env.JWT_SECRET_KEY,
          { expiresIn: '30d' }
      );

      // Set cookie
      res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      // Send response
      res.json({
          user: {
              _id: user._id,
              name: user.name,
              email: user.email
          }
      });

  } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
          message: 'Login failed',
          error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
  }
};


// User Logout

const logoutUser = async (req, res) => {
  res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0)
  });
  res.status(200).json({ message: 'Logged out successfully' });
};



// Update user profile
const updateProfile = async (req, res) => {
  const { name, bio, profilePicture } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();
    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user profile
// controllers/userController.js

const getProfile = async (req, res) => {
  try {
      // Get token from cookies
      const token = req.cookies.token;
      
      if (!token) {
          return res.status(401).json({ message: 'Not authenticated' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      
      // Get user
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Send user data in the same format as login/register
      res.json({
          _id: user._id,
          name: user.name,
          email: user.email
      });

  } catch (error) {
      console.error('Profile fetch error:', error);
      res.status(401).json({ message: 'Not authenticated' });
  }
};




// Follow User
const followUser = async (req, res) => {
    const { userId } = req.body;
  
    try {
      const userToFollow = await User.findById(userId);
  
      if (!userToFollow) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const currentUser = await User.findById(req.user._id);
  
      if (currentUser.following.includes(userId)) {
        return res.status(400).json({ message: 'You are already following this user' });
      }
  
      currentUser.following.push(userId);
      userToFollow.followers.push(req.user._id);
  
      await currentUser.save();
      await userToFollow.save();
  
      res.status(200).json({ message: 'You are now following this user' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // Unfollow User
  const unfollowUser = async (req, res) => {
    const { userId } = req.body;
  
    try {
      const userToUnfollow = await User.findById(userId);
  
      if (!userToUnfollow) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const currentUser = await User.findById(req.user._id);
  
      currentUser.following = currentUser.following.filter(
        (followingUser) => followingUser.toString() !== userId
      );
      userToUnfollow.followers = userToUnfollow.followers.filter(
        (follower) => follower.toString() !== req.user._id.toString()
      );
  
      await currentUser.save();
      await userToUnfollow.save();
  
      res.status(200).json({ message: 'You have unfollowed this user' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };





// Add a recipe to favorites
const addToFavorites = async (req, res) => {
  const { recipeId } = req.body;

  try {
    // Find the recipe
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Find the user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the recipe is already in the favorites
    if (user.favorites.includes(recipeId)) {
      return res.status(400).json({ message: 'Recipe already in favorites' });
    }

    // Add the recipe to favorites
    user.favorites.push(recipeId);
    await user.save();

    res.status(200).json({ message: 'Recipe added to favorites' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


  
module.exports = { registerUser, loginUser, logoutUser, updateProfile, getProfile, followUser, unfollowUser, addToFavorites };
