const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxLength: 200
    },
    content: {
        type: String,
        required: true,
        maxLength: 2000
    },
    type: {
        type: String,
        enum: ['announcement', 'update', 'maintenance', 'warning'],
        default: 'announcement'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },
    targetUsers: {
        type: String,
        enum: ['all', 'active', 'new', 'specific'],
        default: 'all'
    },
    specificUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    expiresAt: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);
