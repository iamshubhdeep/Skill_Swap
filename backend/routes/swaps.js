const express = require('express');
const { body, validationResult } = require('express-validator');
const Swap = require('../models/Swap');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create a new swap request
router.post('/', auth, [
    body('receiverId').notEmpty().withMessage('Receiver ID is required'),
    body('skillOffered.name').notEmpty().withMessage('Skill offered is required'),
    body('skillRequested.name').notEmpty().withMessage('Skill requested is required'),
    body('message').optional().isLength({ max: 1000 }).withMessage('Message too long')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { receiverId, skillOffered, skillRequested, message, scheduledDate, location, duration } = req.body;

        // Check if receiver exists and is not banned
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        if (receiver.isBanned) {
            return res.status(400).json({ message: 'Cannot send swap request to banned user' });
        }

        // Check if user is trying to swap with themselves
        if (req.user.id === receiverId) {
            return res.status(400).json({ message: 'Cannot create swap request with yourself' });
        }

        // Check if there's already a pending swap request
        const existingSwap = await Swap.findOne({
            requester: req.user.id,
            receiver: receiverId,
            status: 'pending'
        });

        if (existingSwap) {
            return res.status(400).json({ message: 'You already have a pending swap request with this user' });
        }

        const swap = new Swap({
            requester: req.user.id,
            receiver: receiverId,
            skillOffered,
            skillRequested,
            message,
            scheduledDate,
            location,
            duration
        });

        await swap.save();
        await swap.populate(['requester', 'receiver'], 'name email profilePhoto');

        res.status(201).json({ message: 'Swap request created successfully', swap });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's swap requests (sent and received)
router.get('/my-swaps', auth, async (req, res) => {
    try {
        const { status, type } = req.query;
        let query = {};

        if (type === 'sent') {
            query.requester = req.user.id;
        } else if (type === 'received') {
            query.receiver = req.user.id;
        } else {
            query.$or = [{ requester: req.user.id }, { receiver: req.user.id }];
        }

        if (status) {
            query.status = status;
        }

        const swaps = await Swap.find(query)
            .populate('requester', 'name profilePhoto rating')
            .populate('receiver', 'name profilePhoto rating')
            .sort({ createdAt: -1 });

        res.json({ swaps });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get swap by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const swap = await Swap.findById(req.params.id)
            .populate('requester', 'name profilePhoto rating')
            .populate('receiver', 'name profilePhoto rating');

        if (!swap) {
            return res.status(404).json({ message: 'Swap not found' });
        }

        // Check if user is part of this swap
        if (swap.requester._id.toString() !== req.user.id &&
            swap.receiver._id.toString() !== req.user.id &&
            !req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json({ swap });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update swap status (accept/reject)
router.put('/:id/status', auth, [
    body('status').isIn(['accepted', 'rejected']).withMessage('Invalid status')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { status } = req.body;
        const swap = await Swap.findById(req.params.id);

        if (!swap) {
            return res.status(404).json({ message: 'Swap not found' });
        }

        // Only receiver can accept/reject
        if (swap.receiver.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the receiver can update swap status' });
        }

        // Can only update pending swaps
        if (swap.status !== 'pending') {
            return res.status(400).json({ message: 'Swap is no longer pending' });
        }

        swap.status = status;
        await swap.save();
        await swap.populate(['requester', 'receiver'], 'name profilePhoto rating');

        res.json({ message: `Swap ${status} successfully`, swap });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark swap as completed
router.put('/:id/complete', auth, async (req, res) => {
    try {
        const swap = await Swap.findById(req.params.id);

        if (!swap) {
            return res.status(404).json({ message: 'Swap not found' });
        }

        // Only participants can mark as completed
        if (swap.requester.toString() !== req.user.id &&
            swap.receiver.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Can only complete accepted swaps
        if (swap.status !== 'accepted') {
            return res.status(400).json({ message: 'Swap must be accepted before completion' });
        }

        swap.status = 'completed';
        await swap.save();
        await swap.populate(['requester', 'receiver'], 'name profilePhoto rating');

        res.json({ message: 'Swap marked as completed', swap });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Cancel swap request
router.delete('/:id', auth, async (req, res) => {
    try {
        const swap = await Swap.findById(req.params.id);

        if (!swap) {
            return res.status(404).json({ message: 'Swap not found' });
        }

        // Only requester can cancel, and only pending swaps
        if (swap.requester.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the requester can cancel the swap' });
        }

        if (swap.status !== 'pending') {
            return res.status(400).json({ message: 'Can only cancel pending swaps' });
        }

        swap.status = 'cancelled';
        await swap.save();

        res.json({ message: 'Swap request cancelled successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Submit feedback
router.post('/:id/feedback', auth, [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isLength({ max: 500 }).withMessage('Comment too long')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { rating, comment } = req.body;
        const swap = await Swap.findById(req.params.id);

        if (!swap) {
            return res.status(404).json({ message: 'Swap not found' });
        }

        // Only completed swaps can have feedback
        if (swap.status !== 'completed') {
            return res.status(400).json({ message: 'Can only provide feedback for completed swaps' });
        }

        let feedbackField;
        let otherUserId;

        if (swap.requester.toString() === req.user.id) {
            feedbackField = 'feedback.requesterFeedback';
            otherUserId = swap.receiver;
        } else if (swap.receiver.toString() === req.user.id) {
            feedbackField = 'feedback.receiverFeedback';
            otherUserId = swap.requester;
        } else {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Check if feedback already submitted
        const existingFeedback = feedbackField === 'feedback.requesterFeedback'
            ? swap.feedback.requesterFeedback
            : swap.feedback.receiverFeedback;

        if (existingFeedback && existingFeedback.rating) {
            return res.status(400).json({ message: 'Feedback already submitted' });
        }

        // Update swap with feedback
        const updateData = {};
        updateData[feedbackField] = {
            rating,
            comment,
            submittedAt: new Date()
        };

        await Swap.findByIdAndUpdate(req.params.id, updateData);

        // Update user rating
        const otherUser = await User.findById(otherUserId);
        const newCount = otherUser.rating.count + 1;
        const newAverage = ((otherUser.rating.average * otherUser.rating.count) + rating) / newCount;

        otherUser.rating.average = Math.round(newAverage * 10) / 10;
        otherUser.rating.count = newCount;
        await otherUser.save();

        res.json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
