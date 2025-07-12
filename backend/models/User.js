const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxLength: 50
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: 6
    },
    location: {
        type: String,
        trim: true,
        maxLength: 100
    },
    profilePhoto: {
        type: String,
        default: ''
    },
    skillsOffered: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            maxLength: 500
        },
        level: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
            default: 'Intermediate'
        }
    }],
    skillsWanted: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            maxLength: 500
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium'
        }
    }],
    availability: {
        weekdays: {
            type: Boolean,
            default: false
        },
        weekends: {
            type: Boolean,
            default: false
        },
        evenings: {
            type: Boolean,
            default: false
        },
        mornings: {
            type: Boolean,
            default: false
        },
        afternoons: {
            type: Boolean,
            default: false
        }
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    banReason: {
        type: String,
        default: ''
    },
    joinedDate: {
        type: Date,
        default: Date.now
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Update last active
userSchema.methods.updateLastActive = function () {
    this.lastActive = new Date();
    return this.save();
};

module.exports = mongoose.model('User', userSchema);
