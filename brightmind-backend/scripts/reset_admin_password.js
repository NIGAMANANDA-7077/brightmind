const path = require('path');
const User = require(path.join(__dirname, '..', 'models', 'User'));
const sequelize = require(path.join(__dirname, '..', 'config', 'db'));

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected');

        const admin = await User.findOne({ where: { email: 'admin@brightmind.com' } });
        if (admin) {
            // Password will be hashed by the beforeUpdate hook in User model
            admin.password = 'password';
            await admin.save();
            console.log('PASSWORD_RESET_SUCCESS: admin@brightmind.com / password');
        } else {
            console.log('ADMIN_NOT_FOUND - Cannot reset');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
})();
