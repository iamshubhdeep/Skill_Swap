const express = require('express');
const { UserDB } = require('../database/db');

const router = express.Router();

// Get skill suggestions based on query
router.get('/suggestions', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.json({ suggestions: [] });
        }

        // Find skills from users' offered and wanted skills
        const users = UserDB.findAll({ isPublic: true, isBanned: false });
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
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get popular skills
router.get('/popular', async (req, res) => {
    try {
        const users = UserDB.findAll({ isPublic: true, isBanned: false });
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
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get skill statistics
router.get('/stats', async (req, res) => {
    try {
        const users = UserDB.findAll({ isPublic: true, isBanned: false });
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
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
