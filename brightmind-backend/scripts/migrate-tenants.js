/**
 * migrate-tenants.js
 * 
 * Run this script ONCE to:
 * 1. Create the `tenants` table
 * 2. Add `tenantId` column to all major tables (if not already present)
 * 3. Sync all model changes with the database
 * 
 * Usage: node scripts/migrate-tenants.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const sequelize = require('../config/db');
const { QueryInterface, DataTypes } = require('sequelize');

// Load models to ensure Sequelize knows about them
require('../models/associations');
const Tenant = require('../models/Tenant');

async function columnExists(tableName, columnName) {
    try {
        const tableDesc = await sequelize.getQueryInterface().describeTable(tableName);
        return !!tableDesc[columnName];
    } catch (err) {
        return false;  // table may not exist yet
    }
}

async function addTenantIdIfMissing(tableName) {
    const exists = await columnExists(tableName, 'tenantId');
    if (!exists) {
        console.log(`  Adding tenantId to ${tableName}...`);
        await sequelize.getQueryInterface().addColumn(tableName, 'tenantId', {
            type: DataTypes.UUID,
            allowNull: true,
            defaultValue: null
        });
        console.log(`  ✓ tenantId added to ${tableName}`);
    } else {
        console.log(`  ✓ tenantId already exists in ${tableName} — skipped`);
    }
}

async function run() {
    try {
        console.log('🔄 Connecting to database...');
        await sequelize.authenticate();
        console.log('✓ Connected\n');

        // 1. Create tenants table (if not exists)
        console.log('📦 Creating tenants table (if not exists)...');
        await Tenant.sync({ alter: false });  // won't drop existing data
        // Force create if not exists:
        await sequelize.getQueryInterface().createTable('tenants', {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            createdBy: {
                type: DataTypes.UUID,
                allowNull: true
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize.fn('NOW')
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize.fn('NOW')
            }
        }, { ifNotExists: true });
        console.log('✓ tenants table ready\n');

        // 2. Add tenantId to all major tables
        console.log('📝 Adding tenantId to major tables...');
        const tables = ['Users', 'Courses', 'batches', 'Exams', 'Assignments', 'Announcements', 'QuestionBanks'];
        for (const table of tables) {
            await addTenantIdIfMissing(table);
        }

        console.log('\n✅ Migration complete!');
        console.log('\nNext steps:');
        console.log('  1. Restart your backend server');
        console.log('  2. When creating a new Admin via Super Admin panel, a Tenant will be created automatically');
        console.log('  3. Existing data will have NULL tenantId — they remain accessible to SuperAdmin');

    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        console.error(err);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

run();
