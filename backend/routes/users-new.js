const express = require('express');
const { body, validationResult } = require('express-validator');
const { UserDB } = require('../database/db');
const { auth, requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profiles/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Get all users (with optional filters)
router.get('/', async (req, res) => {
    try {
        const { isPublic, skill, location, page = 1, limit = 20 } = req.query;

        let filter = {};
        if (isPublic !== undefined) filter.isPublic = isPublic === 'true';
        if (location) filter.location = location;

        let users = UserDB.findAll(filter);

        // Filter by skill if provided
        if (skill) {
            users = users.filter(user =>
                user.skillsOffered.some(s =>
                    s.name.toLowerCase().includes(skill.toLowerCase())
                ) ||
                user.skillsWanted.some(s =>
                    s.name.toLowerCase().includes(skill.toLowerCase())
                )
            );
        }

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedUsers = users.slice(startIndex, endIndex);

        // Remove sensitive data
        const safeUsers = paginatedUsers.map(user => {
            const { password, ...safeUser } = user;
            return safeUser;
        });

        res.json({
            users: safeUsers,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(users.length / limit),
                totalUsers: users.length,
                hasNext: endIndex < users.length,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = UserDB.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove sensitive data
        const { password, ...safeUser } = user;
        res.json({ user: safeUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile
router.put('/profile', auth, [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
    body('location').optional().trim(),
    body('skillsOffered').optional().isArray().withMessage('Skills offered must be an array'),
    body('skillsWanted').optional().isArray().withMessage('Skills wanted must be an array'),
    body('isPublic').optional().isBoolean().withMessage('isPublic must be a boolean')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const updateData = {};
        const allowedFields = ['name', 'bio', 'location', 'skillsOffered', 'skillsWanted', 'isPublic'];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        console.log('Update data:', updateData); // Debug log
        console.log('User ID from auth:', req.user._id); // Debug log

        const updatedUser = UserDB.update(req.user._id, updateData);
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove sensitive data
        const { password, ...safeUser } = updatedUser;
        res.json({
            message: 'Profile updated successfully',
            user: safeUser
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Upload profile photo
router.post('/profile/photo', auth, upload.single('profilePhoto'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const photoPath = `/uploads/profiles/${req.file.filename}`;
        const updatedUser = UserDB.update(req.user.id, { profilePhoto: photoPath });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Profile photo updated successfully',
            profilePhoto: photoPath
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Search users by skills
router.get('/search/skills', async (req, res) => {
    try {
        const { skill } = req.query;
        if (!skill) {
            return res.status(400).json({ message: 'Skill parameter is required' });
        }

        const users = UserDB.findAll({ isPublic: true });
        const matchingUsers = users.filter(user =>
            user.skillsOffered.some(s =>
                s.name.toLowerCase().includes(skill.toLowerCase())
            )
        );

        // Remove sensitive data
        const safeUsers = matchingUsers.map(user => {
            const { password, ...safeUser } = user;
            return safeUser;
        });

        res.json({ users: safeUsers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's swaps
router.get('/:id/swaps', auth, async (req, res) => {
    try {
        // This would integrate with SwapDB when implemented
        res.json({ swaps: [] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
