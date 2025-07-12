const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { UserDB } = require('../database/db');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    try {
        console.log('Registration request received:', req.body);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = UserDB.findByEmail(email);
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Create new user
        console.log('Creating new user:', { name, email });
        const newUser = UserDB.create({
            name,
            email,
            password
        });
        console.log('User created successfully:', newUser._id);

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                isAdmin: newUser.isAdmin,
                skillsOffered: newUser.skillsOffered,
                skillsWanted: newUser.skillsWanted,
                bio: newUser.bio,
                location: newUser.location
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Registration failed'
        });
    }
});

// Login
router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Check if user exists
        const user = UserDB.findByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if user is banned
        if (user.isBanned) {
            return res.status(403).json({ message: 'Account has been banned', reason: user.banReason });
        }

        // Verify password
        const isMatch = UserDB.comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Update last active
        UserDB.update(user._id, { lastActive: new Date().toISOString() });

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                skillsOffered: user.skillsOffered,
                skillsWanted: user.skillsWanted,
                bio: user.bio,
                location: user.location,
                rating: user.rating,
                completedSwaps: user.completedSwaps
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        // req.user is already the full user object from the auth middleware
        const user = req.user;
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                skillsOffered: user.skillsOffered || [],
                skillsWanted: user.skillsWanted || [],
                bio: user.bio,
                location: user.location,
                rating: user.rating,
                completedSwaps: user.completedSwaps,
                isPublic: user.isPublic,
                profilePhoto: user.profilePhoto
            }
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Refresh token
router.post('/refresh', auth, async (req, res) => {
    try {
        const token = jwt.sign(
            { id: req.user.id },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
