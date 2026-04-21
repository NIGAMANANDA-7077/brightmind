const bcrypt = require('bcryptjs');
const seq = require('../config/db');

async function resetSuperAdminPassword() {
    try {
        const newPassword = 'Admin@123';
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(newPassword, salt);

        const [rows] = await seq.query(
            `SELECT id, email, role FROM Users WHERE role = 'SuperAdmin' LIMIT 5`
        );

        if (rows.length === 0) {
            console.log('❌ No SuperAdmin found in database!');
            // Create one
            const [result] = await seq.query(
                `INSERT INTO Users (id, name, email, password, role, status, createdAt, updatedAt)
                 VALUES (UUID(), 'Super Admin', 'superadmin@brightmind.com', ?, 'SuperAdmin', 'Active', NOW(), NOW())`,
                { replacements: [hashed] }
            );
            console.log('✅ SuperAdmin created!');
        } else {
            console.log('Found SuperAdmin accounts:');
            rows.forEach(r => console.log(`  - ${r.email} (${r.role})`));

            await seq.query(
                `UPDATE Users SET password = ?, updatedAt = NOW() WHERE role = 'SuperAdmin'`,
                { replacements: [hashed] }
            );
            console.log(`\n✅ Password reset for all SuperAdmin accounts`);
        }

        console.log('\n📋 New Credentials:');
        console.log('   Email   : superadmin@brightmind.com');
        console.log('   Password: Admin@123');
        console.log('   Role    : Select "Admin" on the login page');
        process.exit(0);
    } catch (e) {
        console.error('❌ Error:', e.message);
        process.exit(1);
    }
}

resetSuperAdminPassword();
