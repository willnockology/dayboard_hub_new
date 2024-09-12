const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log('Token:', token); // Debugging token

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded token:', decoded); // Debugging decoded token

            req.user = await User.findById(decoded.id).select('-password');
            console.log('User found:', req.user); // Debugging user object

            if (!req.user) {
                console.error('User not found');
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error('Token error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        console.error('No token provided');
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
});

const superuser = (req, res, next) => {
    if (req.user && req.user.role === 'Superuser') {
        next();
    } else {
        console.error('Not authorized as a superuser');
        res.status(401).json({ message: 'Not authorized as a superuser' });
    }
};

const userOrSuperuser = (req, res, next) => {
    if (req.user && ['Superuser', 'Company User', 'Captain', 'Crew'].includes(req.user.role)) {
        next();
    } else {
        console.error('Not authorized as a user');
        res.status(401).json({ message: 'Not authorized as a user' });
    }
};

const checkRole = (req, res, next) => {
    if (req.user && ['Superuser', 'Company User', 'Captain'].includes(req.user.role)) {
        next();
    } else {
        console.error('Forbidden: User does not have the required role');
        res.status(403).json({ message: 'Forbidden' });
    }
};

module.exports = { protect, superuser, userOrSuperuser, checkRole };
