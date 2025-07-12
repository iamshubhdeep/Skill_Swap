const express = require('express');
const User = require('../models/User');
const mongoose = require('mongoose');
const router = express.Router();

// Mock data for when database is not available
const mockSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'HTML/CSS',
    'Machine Learning', 'Data Science', 'UI/UX Design', 'Photography',
    'Guitar', 'Spanish', 'Cooking', 'Writing', 'Marketing',
    'Project Management', 'Public Speaking', 'Graphic Design'
];

// Check if database is connected
const isDatabaseConnected = () => {
    return mongoose.connection.readyState === 1;
};

// Get skill suggestions based on query
router.get('/suggestions', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.json({ suggestions: [] });
        }

        if (!isDatabaseConnected()) {
            // Return mock suggestions when database is not available
            const suggestions = mockSkills
                .filter(skill => skill.toLowerCase().includes(q.toLowerCase()))
                .slice(0, 10);
            return res.json({ suggestions });
        }

        // Find skills from users' offered and wanted skills
        const users = await User.find({
            isPublic: true,
            isBanned: false,
            $or: [
                { 'skillsOffered.name': { $regex: q, $options: 'i' } },
                { 'skillsWanted.name': { $regex: q, $options: 'i' } }
            ]
        }).select('skillsOffered skillsWanted');

        const skillSet = new Set();

        users.forEach(user => {
            user.skillsOffered.forEach(skill => {
                if (skill.name.toLowerCase().includes(q.toLowerCase())) {
                    skillSet.add(skill.name);
                }
            });
            user.skillsWanted.forEach(skill => {
                if (skill.name.toLowerCase().includes(q.toLowerCase())) {
                    skillSet.add(skill.name);
                }
            });
        });

        const suggestions = Array.from(skillSet).slice(0, 10);
        res.json({ suggestions });
    } catch (error) {
        console.error('Skills suggestions error:', error);
        // Fallback to mock data on error
        const suggestions = mockSkills
            .filter(skill => skill.toLowerCase().includes(req.query.q?.toLowerCase() || ''))
            .slice(0, 10);
        res.json({ suggestions });
    }
});

// Get popular skills
router.get('/popular', async (req, res) => {
    try {
        if (!isDatabaseConnected()) {
            // Return mock popular skills when database is not available
            const popularSkills = mockSkills.slice(0, 10).map((skill, index) => ({
                name: skill,
                count: Math.floor(Math.random() * 50) + 10
            }));
            return res.json({ skills: popularSkills });
        }

        const users = await User.find({
            isPublic: true,
            isBanned: false
        }).select('skillsOffered skillsWanted');

        const skillCounts = {};

        users.forEach(user => {
            user.skillsOffered.forEach(skill => {
                skillCounts[skill.name] = (skillCounts[skill.name] || 0) + 1;
            });
            user.skillsWanted.forEach(skill => {
                skillCounts[skill.name] = (skillCounts[skill.name] || 0) + 1;
            });
        });

        const popularSkills = Object.entries(skillCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 20)
            .map(([name, count]) => ({ name, count }));

        res.json({ skills: popularSkills });
    } catch (error) {
        console.error('Popular skills error:', error);
        // Fallback to mock data on error
        const popularSkills = mockSkills.slice(0, 10).map((skill, index) => ({
            name: skill,
            count: Math.floor(Math.random() * 50) + 10
        }));
        res.json({ skills: popularSkills });
    }
});

// Get skill statistics
router.get('/stats', async (req, res) => {
    try {
        if (!isDatabaseConnected()) {
            // Return mock stats when database is not available
            return res.json({
                stats: {
                    totalSkillsOffered: 156,
                    totalSkillsWanted: 134,
                    uniqueSkillsCount: mockSkills.length,
                    averageSkillsPerUser: "2.4"
                }
            });
        }

        const users = await User.find({
            isPublic: true,
            isBanned: false
        }).select('skillsOffered skillsWanted');

        const stats = {
            totalSkillsOffered: 0,
            totalSkillsWanted: 0,
            uniqueSkills: new Set(),
            averageSkillsPerUser: 0
        };

        users.forEach(user => {
            stats.totalSkillsOffered += user.skillsOffered.length;
            stats.totalSkillsWanted += user.skillsWanted.length;

            user.skillsOffered.forEach(skill => stats.uniqueSkills.add(skill.name));
            user.skillsWanted.forEach(skill => stats.uniqueSkills.add(skill.name));
        });

        stats.uniqueSkillsCount = stats.uniqueSkills.size;
        stats.averageSkillsPerUser = users.length > 0
            ? ((stats.totalSkillsOffered + stats.totalSkillsWanted) / users.length).toFixed(1)
            : 0;

        delete stats.uniqueSkills; // Remove the Set object before sending response

        res.json({ stats });
    } catch (error) {
        console.error('Skills stats error:', error);
        // Fallback to mock data on error
        res.json({
            stats: {
                totalSkillsOffered: 156,
                totalSkillsWanted: 134,
                uniqueSkillsCount: mockSkills.length,
                averageSkillsPerUser: "2.4"
            }
        });
    }
});

module.exports = router;
