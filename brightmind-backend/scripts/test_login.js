const path = require('path');
const authService = require(path.join(__dirname, '..', 'services', 'authService'));
const sequelize = require(path.join(__dirname, '..', 'config', 'db'));

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected');

        try {
            const user = await authService.loginUser('admin@brightmind.com', 'password');
            console.log('LOGIN_SUCCESS:', user.email);
        } catch (err) {
            console.log('LOGIN_FAILED:', err.message);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
})();
