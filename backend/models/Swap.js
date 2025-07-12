const mongoose = require('mongoose');

const swapSchema = new mongoose.Schema({
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    skillOffered: {
        name: {
            type: String,
            required: true
        },
        description: String,
        level: String
    },
    skillRequested: {
        name: {
            type: String,
            required: true
        },
        description: String,
        priority: String
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
        default: 'pending'
    },
    message: {
        type: String,
        maxLength: 1000
    },
    scheduledDate: {
        type: Date
    },
    location: {
        type: String,
        maxLength: 200
    },
    duration: {
        type: Number, // Duration in hours
        min: 0.5,
        max: 8
    },
    feedback: {
        requesterFeedback: {
            rating: {
                type: Number,
                min: 1,
                max: 5
            },
            comment: {
                type: String,
                maxLength: 500
            },
            submittedAt: Date
        },
        receiverFeedback: {
            rating: {
                type: Number,
                min: 1,
                max: 5
            },
            comment: {
                type: String,
                maxLength: 500
            },
            submittedAt: Date
        }
    },
    adminNotes: {
        type: String,
        maxLength: 1000
    },
    isReported: {
        type: Boolean,
        default: false
    },
    reportReason: {
        type: String,
        maxLength: 500
    }
}, {
    timestamps: true
});

// Index for efficient queries
swapSchema.index({ requester: 1, status: 1 });
swapSchema.index({ receiver: 1, status: 1 });
swapSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Swap', swapSchema);
