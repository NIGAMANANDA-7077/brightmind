const Activity = require('../models/Activity');

exports.getActivities = async (req, res) => {
    try {
        const activities = await Activity.findAll({
            order: [['createdAt', 'DESC']],
            limit: 10
        });
        res.json(activities);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.logActivity = async (data) => {
    try {
        await Activity.create(data);
    } catch (err) {
        console.error("Failed to log activity:", err);
    }
};
