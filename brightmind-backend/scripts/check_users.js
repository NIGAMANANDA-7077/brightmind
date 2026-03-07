const path = require('path');
const User = require(path.join(__dirname, '..', 'models', 'User'));
const sequelize = require(path.join(__dirname, '..', 'config', 'db'));

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected');

        const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role', 'status'] });
        console.log('--- USERS IN DATABASE ---');
        console.log(JSON.stringify(users.map(u => u.toJSON()), null, 2));
        console.log('-------------------------');

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
})();
