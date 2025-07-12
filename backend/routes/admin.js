const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Swap = require('../models/Swap');
const Message = require('../models/Message');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get dashboard stats
router.get('/dashboard', adminAuth, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({
            lastActive: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });
        const bannedUsers = await User.countDocuments({ isBanned: true });

        const totalSwaps = await Swap.countDocuments();
        const pendingSwaps = await Swap.countDocuments({ status: 'pending' });
        const completedSwaps = await Swap.countDocuments({ status: 'completed' });

        const recentSwaps = await Swap.find()
            .populate('requester', 'name email')
            .populate('receiver', 'name email')
            .sort({ createdAt: -1 })
            .limit(10);

        const recentUsers = await User.find()
            .select('name email joinedDate isPublic')
            .sort({ joinedDate: -1 })
            .limit(10);

        res.json({
            stats: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    banned: bannedUsers
                },
                swaps: {
                    total: totalSwaps,
                    pending: pendingSwaps,
                    completed: completedSwaps
                }
            },
            recentSwaps,
            recentUsers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all users with admin controls
router.get('/users', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 20, search, status } = req.query;
        const query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (status === 'banned') {
            query.isBanned = true;
        } else if (status === 'active') {
            query.isBanned = false;
        }

        const users = await User.find(query)
            .select('-password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.json({
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Ban/Unban user
router.put('/users/:id/ban', adminAuth, [
    body('reason').optional().isLength({ max: 500 }).withMessage('Reason too long')
], async (req, res) => {
    try {
        const { reason } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isAdmin) {
            return res.status(400).json({ message: 'Cannot ban admin users' });
        }

        user.isBanned = !user.isBanned;
        user.banReason = user.isBanned ? (reason || 'No reason provided') : '';
        await user.save();

        res.json({
            message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isBanned: user.isBanned,
                banReason: user.banReason
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all swaps with admin controls
router.get('/swaps', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 20, status, reported } = req.query;
        const query = {};

        if (status) {
            query.status = status;
        }

        if (reported === 'true') {
            query.isReported = true;
        }

        const swaps = await Swap.find(query)
            .populate('requester', 'name email')
            .populate('receiver', 'name email')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Swap.countDocuments(query);

        res.json({
            swaps,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update swap admin notes
router.put('/swaps/:id/notes', adminAuth, [
    body('adminNotes').isLength({ max: 1000 }).withMessage('Notes too long')
], async (req, res) => {
    try {
        const { adminNotes } = req.body;

        const swap = await Swap.findByIdAndUpdate(
            req.params.id,
            { adminNotes },
            { new: true }
        ).populate('requester', 'name email')
            .populate('receiver', 'name email');

        if (!swap) {
            return res.status(404).json({ message: 'Swap not found' });
        }

        res.json({ message: 'Admin notes updated successfully', swap });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create platform-wide message
router.post('/messages', adminAuth, [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('type').isIn(['announcement', 'update', 'maintenance', 'warning']).withMessage('Invalid type'),
    body('priority').isIn(['low', 'normal', 'high', 'urgent']).withMessage('Invalid priority')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const message = new Message({
            ...req.body,
            createdBy: req.user.id
        });

        await message.save();
        await message.populate('createdBy', 'name email');

        res.status(201).json({ message: 'Platform message created successfully', data: message });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all platform messages
router.get('/messages', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 20, active } = req.query;
        const query = {};

        if (active === 'true') {
            query.isActive = true;
        }

        const messages = await Message.find(query)
            .populate('createdBy', 'name email')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Message.countDocuments(query);

        res.json({
            messages,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Toggle message active status
router.put('/messages/:id/toggle', adminAuth, async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        message.isActive = !message.isActive;
        await message.save();

        res.json({
            message: `Message ${message.isActive ? 'activated' : 'deactivated'} successfully`,
            data: message
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Generate reports
router.get('/reports/:type', adminAuth, async (req, res) => {
    try {
        const { type } = req.params;
        const { startDate, endDate } = req.query;

        let matchQuery = {};
        if (startDate && endDate) {
            matchQuery.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        let report = {};

        switch (type) {
            case 'users':
                report = await User.aggregate([
                    { $match: matchQuery },
                    {
                        $group: {
                            _id: null,
                            totalUsers: { $sum: 1 },
                            publicProfiles: { $sum: { $cond: ['$isPublic', 1, 0] } },
                            bannedUsers: { $sum: { $cond: ['$isBanned', 1, 0] } },
                            avgSkillsOffered: { $avg: { $size: '$skillsOffered' } },
                            avgSkillsWanted: { $avg: { $size: '$skillsWanted' } }
                        }
                    }
                ]);
                break;

            case 'swaps':
                report = await Swap.aggregate([
                    { $match: matchQuery },
                    {
                        $group: {
                            _id: '$status',
                            count: { $sum: 1 }
                        }
                    }
                ]);
                break;

            case 'activity':
                report = await Swap.aggregate([
                    { $match: matchQuery },
                    {
                        $group: {
                            _id: {
                                year: { $year: '$createdAt' },
                                month: { $month: '$createdAt' },
                                day: { $dayOfMonth: '$createdAt' }
                            },
                            swapsCreated: { $sum: 1 }
                        }
                    },
                    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
                ]);
                break;

            default:
                return res.status(400).json({ message: 'Invalid report type' });
        }

        res.json({ report, type, generatedAt: new Date() });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
