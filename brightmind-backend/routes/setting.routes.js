const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');

// Get all settings or a specific key
router.get('/', async (req, res) => {
    try {
        const settings = await Setting.findAll();
        const settingsMap = {};
        settings.forEach(s => {
            settingsMap[s.key] = s.value;
        });
        res.json(settingsMap);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update or create setting
router.post('/', async (req, res) => {
    try {
        const { key, value } = req.body;
        if (!key) return res.status(400).json({ success: false, message: 'Key is required' });

        const [setting, created] = await Setting.findOrCreate({
            where: { key },
            defaults: { value }
        });

        if (!created) {
            setting.value = value;
            await setting.save();
        }

        res.json({ success: true, setting });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
