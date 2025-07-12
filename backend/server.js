const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize file-based database
const { initializeDB } = require('./database/db');
initializeDB();

// Basic health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running with file-based database',
        timestamp: new Date().toISOString()
    });
});

// Routes
try {
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/users', require('./routes/users-new'));
    app.use('/api/skills', require('./routes/skills-new'));
    app.use('/api/swaps', require('./routes/swaps-new'));
    app.use('/api/admin', require('./routes/admin'));
    console.log('All routes loaded successfully');
} catch (error) {
    console.error('Error loading routes:', error);
}

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Catch-all route for unmatched API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/api/health`);
    console.log('Using file-based JSON database');
});


