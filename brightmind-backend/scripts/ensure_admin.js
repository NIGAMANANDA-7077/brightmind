const path = require('path');
const User = require(path.join(__dirname, '..', 'models', 'User'));
const sequelize = require(path.join(__dirname, '..', 'config', 'db'));

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected');

        const admin = await User.findOne({ where: { role: 'Admin' } });
        if (admin) {
            console.log('ADMIN_FOUND:', admin.email);
        } else {
            console.log('ADMIN_NOT_FOUND');
            // Create a default admin for recovery
            await User.create({
                name: 'System Admin',
                email: 'admin@brightmind.com',
                password: 'password', // Hooks will hash it
                role: 'Admin',
                status: 'Active'
            });
            console.log('ADMIN_CREATED: admin@brightmind.com / password');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
})();
