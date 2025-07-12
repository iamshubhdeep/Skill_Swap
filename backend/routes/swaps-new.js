const express = require('express');
const { body, validationResult } = require('express-validator');
const { SwapDB, UserDB } = require('../database/db');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create a new swap request
router.post('/', auth, [
    body('providerId').notEmpty().withMessage('Provider ID is required'),
    body('requesterOfferedSkill').notEmpty().withMessage('Skill you offer is required'),
    body('requesterWantedSkill').notEmpty().withMessage('Skill you want is required'),
    body('message').optional().isLength({ max: 1000 }).withMessage('Message too long')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { providerId, requesterOfferedSkill, requesterWantedSkill, message } = req.body;

        // Check if provider exists
        const provider = UserDB.findById(providerId);
        if (!provider) {
            return res.status(404).json({ message: 'Provider not found' });
        }

        // Check if user is trying to swap with themselves
        if (req.user._id === providerId) {
            return res.status(400).json({ message: 'Cannot create swap request with yourself' });
        }

        // Check if there's already a pending swap request
        const existingSwaps = SwapDB.findByUserId(req.user._id);
        const existingSwap = existingSwaps.find(swap =>
            swap.requesterId === req.user._id &&
            swap.providerId === providerId &&
            swap.status === 'pending'
        );

        if (existingSwap) {
            return res.status(400).json({ message: 'You already have a pending swap request with this user' });
        }

        const swapData = {
            requesterId: req.user._id,
            providerId: providerId,
            requesterOfferedSkill,
            requesterWantedSkill,
            message: message || `I'd like to swap my ${requesterOfferedSkill} skills for your ${requesterWantedSkill} skills.`,
            status: 'pending'
        };

        const swap = SwapDB.create(swapData);

        // Get requester and provider info for response
        const requester = UserDB.findById(req.user._id);
        const swapWithDetails = {
            ...swap,
            requester: {
                _id: requester._id,
                name: requester.name,
                email: requester.email,
                profilePhoto: requester.profilePhoto
            },
            provider: {
                _id: provider._id,
                name: provider.name,
                email: provider.email,
                profilePhoto: provider.profilePhoto
            }
        };

        res.status(201).json({
            message: 'Swap request created successfully',
            swap: swapWithDetails
        });
    } catch (error) {
        console.error('Create swap error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's swap requests (sent and received)
router.get('/my-swaps', auth, async (req, res) => {
    try {
        const { status, type } = req.query;

        let swaps = SwapDB.findByUserId(req.user._id);

        // Filter by type (sent/received)
        if (type === 'sent') {
            swaps = swaps.filter(swap => swap.requesterId === req.user._id);
        } else if (type === 'received') {
            swaps = swaps.filter(swap => swap.providerId === req.user._id);
        }

        // Filter by status
        if (status) {
            swaps = swaps.filter(swap => swap.status === status);
        }

        // Add user details to swaps
        const swapsWithDetails = swaps.map(swap => {
            const requester = UserDB.findById(swap.requesterId);
            const provider = UserDB.findById(swap.providerId);

            return {
                ...swap,
                requester: requester ? {
                    _id: requester._id,
                    name: requester.name,
                    email: requester.email,
                    profilePhoto: requester.profilePhoto,
                    rating: requester.rating
                } : null,
                provider: provider ? {
                    _id: provider._id,
                    name: provider.name,
                    email: provider.email,
                    profilePhoto: provider.profilePhoto,
                    rating: provider.rating
                } : null
            };
        });

        // Sort by creation date (newest first)
        swapsWithDetails.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json({ swaps: swapsWithDetails });
    } catch (error) {
        console.error('Get my swaps error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get swap by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const swap = SwapDB.findById(req.params.id);
        if (!swap) {
            return res.status(404).json({ message: 'Swap not found' });
        }

        // Check if user is involved in this swap
        if (swap.requesterId !== req.user._id && swap.providerId !== req.user._id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Add user details
        const requester = UserDB.findById(swap.requesterId);
        const provider = UserDB.findById(swap.providerId);

        const swapWithDetails = {
            ...swap,
            requester: requester ? {
                _id: requester._id,
                name: requester.name,
                email: requester.email,
                profilePhoto: requester.profilePhoto,
                rating: requester.rating
            } : null,
            provider: provider ? {
                _id: provider._id,
                name: provider.name,
                email: provider.email,
                profilePhoto: provider.profilePhoto,
                rating: provider.rating
            } : null
        };

        res.json({ swap: swapWithDetails });
    } catch (error) {
        console.error('Get swap error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update swap status (accept, decline, complete)
router.put('/:id/status', auth, [
    body('status').isIn(['accepted', 'declined', 'completed', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { status } = req.body;
        const swap = SwapDB.findById(req.params.id);

        if (!swap) {
            return res.status(404).json({ message: 'Swap not found' });
        }

        // Check permissions based on status change
        if (status === 'accepted' || status === 'declined') {
            // Only the provider can accept/decline
            if (swap.providerId !== req.user._id) {
                return res.status(403).json({ message: 'Only the provider can accept or decline swap requests' });
            }
        } else if (status === 'completed') {
            // Either party can mark as completed
            if (swap.requesterId !== req.user._id && swap.providerId !== req.user._id) {
                return res.status(403).json({ message: 'Access denied' });
            }
        } else if (status === 'cancelled') {
            // Only the requester can cancel
            if (swap.requesterId !== req.user._id) {
                return res.status(403).json({ message: 'Only the requester can cancel swap requests' });
            }
        }

        // Validate status transitions
        if (swap.status === 'completed' && status !== 'completed') {
            return res.status(400).json({ message: 'Cannot change status of completed swap' });
        }

        const updatedSwap = SwapDB.update(req.params.id, { status });

        if (!updatedSwap) {
            return res.status(404).json({ message: 'Swap not found' });
        }

        // Add user details for response
        const requester = UserDB.findById(updatedSwap.requesterId);
        const provider = UserDB.findById(updatedSwap.providerId);

        const swapWithDetails = {
            ...updatedSwap,
            requester: requester ? {
                _id: requester._id,
                name: requester.name,
                email: requester.email,
                profilePhoto: requester.profilePhoto
            } : null,
            provider: provider ? {
                _id: provider._id,
                name: provider.name,
                email: provider.email,
                profilePhoto: provider.profilePhoto
            } : null
        };

        res.json({
            message: `Swap ${status} successfully`,
            swap: swapWithDetails
        });
    } catch (error) {
        console.error('Update swap status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Submit feedback for completed swap
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
        const swap = SwapDB.findById(req.params.id);

        if (!swap) {
            return res.status(404).json({ message: 'Swap not found' });
        }

        // Check if user is involved in this swap
        if (swap.requesterId !== req.user._id && swap.providerId !== req.user._id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Check if swap is completed
        if (swap.status !== 'completed') {
            return res.status(400).json({ message: 'Can only provide feedback for completed swaps' });
        }

        // Determine if user is requester or provider and update accordingly
        const feedbackData = {
            rating,
            comment,
            submittedAt: new Date().toISOString()
        };

        let updateField = {};
        if (swap.requesterId === req.user._id) {
            updateField.requesterFeedback = feedbackData;
        } else {
            updateField.providerFeedback = feedbackData;
        }

        const updatedSwap = SwapDB.update(req.params.id, updateField);

        res.json({
            message: 'Feedback submitted successfully',
            swap: updatedSwap
        });
    } catch (error) {
        console.error('Submit feedback error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete/cancel swap
router.delete('/:id', auth, async (req, res) => {
    try {
        const swap = SwapDB.findById(req.params.id);

        if (!swap) {
            return res.status(404).json({ message: 'Swap not found' });
        }

        // Only requester can delete/cancel
        if (swap.requesterId !== req.user._id) {
            return res.status(403).json({ message: 'Only the requester can cancel swap requests' });
        }

        // Can't delete completed swaps
        if (swap.status === 'completed') {
            return res.status(400).json({ message: 'Cannot cancel completed swaps' });
        }

        const deleted = SwapDB.delete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: 'Swap not found' });
        }

        res.json({ message: 'Swap cancelled successfully' });
    } catch (error) {
        console.error('Delete swap error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
