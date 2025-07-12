const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Database file paths
const DB_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DB_DIR, 'users.json');
const SWAPS_FILE = path.join(DB_DIR, 'swaps.json');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initialize database files if they don't exist
const initializeDatabase = () => {
    if (!fs.existsSync(USERS_FILE)) {
        const initialUsers = [
            {
                _id: '507f1f77bcf86cd799439011',
                name: 'John Doe',
                email: 'john@example.com',
                password: bcrypt.hashSync('password123', 10),
                isAdmin: false,
                skillsOffered: [
                    { name: 'JavaScript', level: 'Advanced', description: 'React, Node.js development' },
                    { name: 'Python', level: 'Intermediate', description: 'Django, Flask' }
                ],
                skillsWanted: [
                    { name: 'Machine Learning', level: 'Beginner', description: 'Want to learn ML basics' }
                ],
                bio: 'Full-stack developer with 5 years experience',
                location: 'San Francisco, CA',
                rating: 4.8,
                completedSwaps: 12,
                isPublic: true,
                isBanned: false,
                createdAt: new Date().toISOString(),
                lastActive: new Date().toISOString()
            },
            {
                _id: '507f1f77bcf86cd799439012',
                name: 'Jane Smith',
                email: 'jane@example.com',
                password: bcrypt.hashSync('password123', 10),
                isAdmin: true,
                skillsOffered: [
                    { name: 'UI/UX Design', level: 'Expert', description: 'Figma, Adobe Creative Suite' },
                    { name: 'Product Management', level: 'Advanced', description: 'Agile, Scrum' }
                ],
                skillsWanted: [
                    { name: 'React Native', level: 'Intermediate', description: 'Mobile app development' }
                ],
                bio: 'Senior Product Designer with focus on user experience',
                location: 'New York, NY',
                rating: 4.9,
                completedSwaps: 25,
                isPublic: true,
                isBanned: false,
                createdAt: new Date().toISOString(),
                lastActive: new Date().toISOString()
            },
            {
                _id: '507f1f77bcf86cd799439013',
                name: 'Alice Johnson',
                email: 'alice@example.com',
                password: bcrypt.hashSync('password123', 10),
                isAdmin: false,
                skillsOffered: [
                    { name: 'Data Science', level: 'Expert', description: 'Python, R, Machine Learning' },
                    { name: 'Statistics', level: 'Advanced', description: 'Statistical analysis and modeling' }
                ],
                skillsWanted: [
                    { name: 'Cloud Computing', level: 'Intermediate', description: 'AWS, Azure' },
                    { name: 'DevOps', level: 'Beginner', description: 'CI/CD, Docker' }
                ],
                bio: 'Data scientist passionate about machine learning and analytics',
                location: 'Seattle, WA',
                rating: 4.7,
                completedSwaps: 8,
                isPublic: true,
                isBanned: false,
                createdAt: new Date().toISOString(),
                lastActive: new Date().toISOString()
            }
        ];
        fs.writeFileSync(USERS_FILE, JSON.stringify(initialUsers, null, 2));
    }

    if (!fs.existsSync(SWAPS_FILE)) {
        const initialSwaps = [];
        fs.writeFileSync(SWAPS_FILE, JSON.stringify(initialSwaps, null, 2));
    }
};

// Read from file
const readFromFile = (filename) => {
    try {
        const data = fs.readFileSync(filename, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading from ${filename}:`, error);
        return [];
    }
};

// Write to file
const writeToFile = (filename, data) => {
    try {
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing to ${filename}:`, error);
        return false;
    }
};

// Generate unique ID
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// User operations
const UserDB = {
    findAll: (filter = {}) => {
        const users = readFromFile(USERS_FILE);
        if (Object.keys(filter).length === 0) return users;

        return users.filter(user => {
            return Object.keys(filter).every(key => {
                if (key === 'isPublic' || key === 'isBanned') {
                    return user[key] === filter[key];
                }
                return user[key] && user[key].toString().toLowerCase().includes(filter[key].toString().toLowerCase());
            });
        });
    },

    findById: (id) => {
        const users = readFromFile(USERS_FILE);
        return users.find(user => user._id === id);
    },

    findByEmail: (email) => {
        const users = readFromFile(USERS_FILE);
        return users.find(user => user.email === email);
    },

    create: (userData) => {
        try {
            console.log('UserDB.create called with:', userData);
            const users = readFromFile(USERS_FILE);
            console.log('Current users count:', users.length);

            const newUser = {
                _id: generateId(),
                ...userData,
                password: bcrypt.hashSync(userData.password, 10),
                isAdmin: false,
                skillsOffered: userData.skillsOffered || [],
                skillsWanted: userData.skillsWanted || [],
                bio: userData.bio || '',
                location: userData.location || '',
                rating: 0,
                completedSwaps: 0,
                isPublic: true,
                isBanned: false,
                createdAt: new Date().toISOString(),
                lastActive: new Date().toISOString()
            };

            console.log('New user object created:', { ...newUser, password: '[HIDDEN]' });
            users.push(newUser);
            const writeSuccess = writeToFile(USERS_FILE, users);
            console.log('Write to file success:', writeSuccess);

            return newUser;
        } catch (error) {
            console.error('Error in UserDB.create:', error);
            throw error;
        }
    },

    update: (id, updateData) => {
        const users = readFromFile(USERS_FILE);
        const index = users.findIndex(user => user._id === id);
        if (index === -1) return null;

        users[index] = { ...users[index], ...updateData, lastActive: new Date().toISOString() };
        writeToFile(USERS_FILE, users);
        return users[index];
    },

    delete: (id) => {
        const users = readFromFile(USERS_FILE);
        const filteredUsers = users.filter(user => user._id !== id);
        writeToFile(USERS_FILE, filteredUsers);
        return filteredUsers.length < users.length;
    },

    comparePassword: (inputPassword, hashedPassword) => {
        return bcrypt.compareSync(inputPassword, hashedPassword);
    }
};

// Swap operations
const SwapDB = {
    findAll: (filter = {}) => {
        const swaps = readFromFile(SWAPS_FILE);
        if (Object.keys(filter).length === 0) return swaps;

        return swaps.filter(swap => {
            return Object.keys(filter).every(key => {
                return swap[key] && swap[key].toString().toLowerCase().includes(filter[key].toString().toLowerCase());
            });
        });
    },

    findById: (id) => {
        const swaps = readFromFile(SWAPS_FILE);
        return swaps.find(swap => swap._id === id);
    },

    findByUserId: (userId) => {
        const swaps = readFromFile(SWAPS_FILE);
        return swaps.filter(swap => swap.requesterId === userId || swap.providerId === userId);
    },

    create: (swapData) => {
        const swaps = readFromFile(SWAPS_FILE);
        const newSwap = {
            _id: generateId(),
            ...swapData,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        swaps.push(newSwap);
        writeToFile(SWAPS_FILE, swaps);
        return newSwap;
    },

    update: (id, updateData) => {
        const swaps = readFromFile(SWAPS_FILE);
        const index = swaps.findIndex(swap => swap._id === id);
        if (index === -1) return null;

        swaps[index] = { ...swaps[index], ...updateData, updatedAt: new Date().toISOString() };
        writeToFile(SWAPS_FILE, swaps);
        return swaps[index];
    },

    delete: (id) => {
        const swaps = readFromFile(SWAPS_FILE);
        const filteredSwaps = swaps.filter(swap => swap._id !== id);
        writeToFile(SWAPS_FILE, filteredSwaps);
        return filteredSwaps.length < swaps.length;
    }
};

// Initialize database on startup
const initializeDB = () => {
    initializeDatabase();
};

module.exports = {
    UserDB,
    SwapDB,
    generateId,
    initializeDB
};
