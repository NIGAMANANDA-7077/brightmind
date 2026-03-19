const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const superadminController = require('../controllers/superadminController');

const guard = [protect, authorize('SuperAdmin')];

// List all admins (Admin + SuperAdmin roles)
router.get('/admins',                        ...guard, superadminController.listAdmins);

// Create a new Admin or SuperAdmin
router.post('/create-admin',                 ...guard, superadminController.createAdmin);

// Update status (Active / Suspended)
router.patch('/admins/:id/status',           ...guard, superadminController.updateAdminStatus);

// Delete an admin
router.delete('/admins/:id',                 ...guard, superadminController.deleteAdmin);

// Reset password
router.patch('/admins/:id/reset-password',   ...guard, superadminController.resetAdminPassword);

// Get admin activity logs (specific admin)
router.get('/admins/:id/activity',           ...guard, superadminController.getAdminActivity);

// Get ALL admin activity logs (global feed with filters)
router.get('/activity-logs',                 ...guard, superadminController.getAllAdminActivities);

// ─── Admin Impersonation ──────────────────────────────────────────────
router.post('/impersonate-admin/:id',        ...guard, superadminController.impersonateAdmin);
router.post('/exit-impersonation',           protect,  superadminController.exitImpersonation);

// ─── Tenant Management ────────────────────────────────────────────────
router.get('/tenants',                       ...guard, superadminController.listTenants);
router.get('/tenants/:id/stats',             ...guard, superadminController.getTenantStats);

module.exports = router;
