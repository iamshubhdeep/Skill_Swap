const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Swap = require('../models/Swap');
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

// Check if database is connected
const isDatabaseConnected = () => {
    return mongoose.connection.readyState === 1;
};

// Mock users data for when database is not available
const mockUsers = [
    {
        _id: '1',
        name: 'Alice Johnson',
        profilePhoto: null,
        skillsOffered: [
            { name: 'JavaScript', level: 'Advanced' },
            { name: 'React', level: 'Expert' }
        ],
        skillsWanted: [
            { name: 'Python', level: 'Intermediate' },
            { name: 'Machine Learning', level: 'Beginner' }
        ],
        bio: 'Full-stack developer with 5 years of experience. Love teaching and learning new technologies.',
        rating: 4.8,
        completedSwaps: 12,
        location: 'San Francisco, CA'
    },
    {
        _id: '2',
        name: 'Bob Smith',
        profilePhoto: null,
        skillsOffered: [
            { name: 'Python', level: 'Expert' },
            { name: 'Data Science', level: 'Advanced' }
        ],
        skillsWanted: [
            { name: 'UI/UX Design', level: 'Beginner' },
            { name: 'Photography', level: 'Intermediate' }
        ],
        bio: 'Data scientist passionate about machine learning and AI.',
        rating: 4.9,
        completedSwaps: 18,
        location: 'New York, NY'
    },
    {
        _id: '3',
        name: 'Carol Davis',
        profilePhoto: null,
        skillsOffered: [
            { name: 'UI/UX Design', level: 'Expert' },
            { name: 'Graphic Design', level: 'Advanced' }
        ],
        skillsWanted: [
            { name: 'JavaScript', level: 'Intermediate' },
            { name: 'Marketing', level: 'Beginner' }
        ],
        bio: 'Creative designer with an eye for detail and user experience.',
        rating: 4.7,
        completedSwaps: 8,
        location: 'Los Angeles, CA'
    }
];

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profiles/');
    },
    filename: (req, file, cb) => {
        cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = 'uploads/profiles';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Get all public users with pagination and filtering
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, skill, location, search } = req.query;

        if (!isDatabaseConnected()) {
            // Return mock users when database is not available
            let filteredUsers = [...mockUsers];

            // Apply filters to mock data
            if (skill) {
                filteredUsers = filteredUsers.filter(user =>
                    user.skillsOffered.some(s => s.name.toLowerCase().includes(skill.toLowerCase())) ||
                    user.skillsWanted.some(s => s.name.toLowerCase().includes(skill.toLowerCase()))
                );
            }

            if (location) {
                filteredUsers = filteredUsers.filter(user =>
                    user.location?.toLowerCase().includes(location.toLowerCase())
                );
            }

            if (search) {
                filteredUsers = filteredUsers.filter(user =>
                    user.name.toLowerCase().includes(search.toLowerCase()) ||
                    user.skillsOffered.some(s => s.name.toLowerCase().includes(search.toLowerCase())) ||
                    user.skillsWanted.some(s => s.name.toLowerCase().includes(search.toLowerCase()))
                );
            }

            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + parseInt(limit);
            const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

            return res.json({
                users: paginatedUsers,
                totalPages: Math.ceil(filteredUsers.length / limit),
                currentPage: parseInt(page),
                total: filteredUsers.length
            });
        }

        const query = { isPublic: true, isBanned: false };

        // Build search criteria
        if (skill) {
            query.$or = [
                { 'skillsOffered.name': { $regex: skill, $options: 'i' } },
                { 'skillsWanted.name': { $regex: skill, $options: 'i' } }
            ];
        }

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { 'skillsOffered.name': { $regex: search, $options: 'i' } },
                { 'skillsWanted.name': { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password -email')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ 'rating.average': -1, createdAt: -1 });

        const total = await User.countDocuments(query);

        res.json({
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Users route error:', error);
        // Fallback to mock data on error
        const filteredUsers = [...mockUsers];
        res.json({
            users: filteredUsers,
            totalPages: 1,
            currentPage: 1,
            total: filteredUsers.length
        });
    }
});

// Get user profile by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password -email');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.isPublic && (!req.user || req.user.id !== user._id.toString())) {
            return res.status(403).json({ message: 'Profile is private' });
        }

        res.json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile
router.put('/profile', auth, [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('location').optional().trim(),
    body('skillsOffered').optional().isArray(),
    body('skillsWanted').optional().isArray(),
    body('availability').optional().isObject(),
    body('isPublic').optional().isBoolean()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const allowedFields = ['name', 'location', 'skillsOffered', 'skillsWanted', 'availability', 'isPublic'];
        const updateData = {};

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Upload profile photo
router.post('/profile/photo', auth, upload.single('profilePhoto'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { profilePhoto: `/uploads/profiles/${req.file.filename}` },
            { new: true }
        ).select('-password');

        res.json({ message: 'Profile photo updated successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's swap history
router.get('/:id/swaps', auth, async (req, res) => {
    try {
        const userId = req.params.id;

        // Users can only view their own swap history unless they're admin
        if (req.user.id !== userId && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const swaps = await Swap.find({
            $or: [{ requester: userId }, { receiver: userId }]
        })
            .populate('requester', 'name profilePhoto')
            .populate('receiver', 'name profilePhoto')
            .sort({ createdAt: -1 });

        res.json({ swaps });
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

        const users = await User.find({
            isPublic: true,
            isBanned: false,
            'skillsOffered.name': { $regex: skill, $options: 'i' }
        })
            .select('-password -email')
            .sort({ 'rating.average': -1 });

        res.json({ users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
