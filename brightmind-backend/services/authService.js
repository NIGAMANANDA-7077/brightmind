const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
    generateToken(id) {
        return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
            expiresIn: '30d',
        });
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
            token: this.generateToken(user.id)
        };
    }

    async loginUser(email, password) {
        const user = await User.findOne({ where: { email } });

        if (user && (await user.matchPassword(password))) {
            const { password: _, ...userPayload } = user.toJSON();
            return {
                ...userPayload,
                token: this.generateToken(user.id)
            };
        } else {
            throw new Error('Invalid email or password');
        }
    }
}

module.exports = new AuthService();
