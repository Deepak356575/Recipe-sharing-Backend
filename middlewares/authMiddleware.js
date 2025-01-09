const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // Get token from cookies
    if (req.cookies.token) {
        token = req.cookies.token;

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

            // Attach user to request object
            req.user = await User.findById(decoded.id).select('-password');
            next(); // Proceed to the next middleware or controller
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
