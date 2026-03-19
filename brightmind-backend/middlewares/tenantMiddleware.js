/**
 * tenantMiddleware — injects req.tenantId from the authenticated user.
 * Must be used AFTER the `protect` middleware.
 *
 * - SuperAdmin: req.tenantId = null  (sees all data)
 * - Everyone else: req.tenantId = req.user.tenantId
 *
 * Controllers should use req.tenantId exclusively.
 * NEVER trust tenant_id from req.body or req.query.
 */
const tenantMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    req.tenantId = req.user.role === 'SuperAdmin' ? null : (req.user.tenantId || null);
    console.log(`[TenantMiddleware] user: ${req.user.id}, role: ${req.user.role}, tenantId: ${req.tenantId}`);
    next();
};

module.exports = tenantMiddleware;
