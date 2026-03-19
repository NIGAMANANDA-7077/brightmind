const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
    generateToken(id, extraPayload = {}) {
        return jwt.sign({ id, ...extraPayload }, process.env.JWT_SECRET || 'fallback_secret', {
            expiresIn: '30d',
        });
    }

    _buildToken(user) {
        return this.generateToken(user.id, { tenantId: user.tenantId || null });
    }

    async registerUser(userData) {
        const { name, email, password, role } = userData;

        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            throw new Error('User already exists');
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'Student'
        });

        const { password: _, ...userPayload } = user.toJSON();
        return {
            ...userPayload,
            token: this._buildToken(user)
        };
    }

    async loginUser(email, password, role) {
        const user = await User.findOne({ where: { email } });

        if (!user || !(await user.matchPassword(password))) {
            throw new Error('Invalid email or password');
        }

        if (user.status === 'Suspended') {
            throw new Error('Account suspended');
        }

        // Strict role check: enforce that the selected role matches the stored role
        if (role) {
            // Normalize incoming role to title-case (e.g. 'admin' -> 'Admin')
            const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
            const actualRole = user.role; // e.g. 'Admin', 'Teacher', 'Student', 'SuperAdmin'

            // 'Admin' selection allows both Admin and SuperAdmin to log in
            const isAdminSelection = normalizedRole === 'Admin';
            const roleMatches = isAdminSelection
                ? (actualRole === 'Admin' || actualRole === 'SuperAdmin')
                : actualRole === normalizedRole;

            if (!roleMatches) {
                throw new Error('Role mismatch');
            }
        }

        await user.update({ lastLoginAt: new Date() });
        const { password: _, ...userPayload } = user.toJSON();
        return {
            ...userPayload,
            token: this._buildToken(user)
        };
    }

    async loginWithStudentId(studentId, password) {
        const user = await User.findOne({ where: { studentId, role: 'Student' } });

        if (!user || !(await user.matchPassword(password))) {
            throw new Error('Invalid student ID or password');
        }

        if (user.status === 'Suspended') {
            throw new Error('Account suspended');
        }

        await user.update({ lastLoginAt: new Date() });
        const { password: _, ...userPayload } = user.toJSON();
        return {
            ...userPayload,
            token: this._buildToken(user)
        };
    }
}

module.exports = new AuthService();
