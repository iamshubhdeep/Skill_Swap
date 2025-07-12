const jwt = require('jsonwebtoken');
const { UserDB } = require('../database/db');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const user = UserDB.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'Token is not valid' });
        }

        if (user.isBanned) {
            return res.status(403).json({ message: 'Account has been banned', reason: user.banReason });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const adminAuth = async (req, res, next) => {
    try {
        await auth(req, res, () => {
            if (!req.user.isAdmin) {
                return res.status(403).json({ message: 'Admin access required' });
            }
            next();
        });
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = { auth, adminAuth };
