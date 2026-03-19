// Test Railway login locally
const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

const DB_URL = 'mysql://root:fAoteExVfyCzFPILGumipatgNVvOIROK@gondola.proxy.rlwy.net:17638/railway';
const sequelize = new Sequelize(DB_URL, { dialect: 'mysql', logging: false });

const testLogin = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to Railway\n');

        const [users] = await sequelize.query(
            "SELECT id, name, email, password, role FROM Users WHERE email = 'priya@student.com'"
        );

        if (users.length === 0) {
            console.log('❌ User not found');
            process.exit(1);
        }

        const user = users[0];
        console.log('Found user:', user.name, user.email, user.role);
        
        const password = 'password123';
        const isMatch = await bcrypt.compare(password, user.password);
        
        console.log('\nPassword match:', isMatch ? '✅ YES' : '❌ NO');
        console.log('Entered password:', password);
        console.log('Stored hash (first 30 chars):', user.password.substring(0, 30));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

testLogin();
