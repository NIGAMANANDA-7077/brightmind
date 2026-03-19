const AdminActivityLog = require('../models/AdminActivityLog');

/**
 * Log an admin action to admin_activity_logs table.
 * @param {string} adminId      - UUID of the admin performing the action
 * @param {string} moduleName   - Module name: course, exam, batch, user, settings, announcement
 * @param {string} actionType   - One of: CREATE, UPDATE, DELETE, ASSIGN, OTHER
 * @param {string} description  - Human-readable description of the action
 * @param {string} [ipAddress]  - Optional IP address of the request
 */
const logAdminActivity = async (adminId, moduleName, actionType, description, ipAddress = null) => {
    if (!adminId) return;
    try {
        await AdminActivityLog.create({ adminId, moduleName, actionType, description, ipAddress });
    } catch (err) {
        // Non-critical - log silently, never throw
        console.error('[ActivityLog] Failed to log activity:', err.message);
    }
};

module.exports = logAdminActivity;
