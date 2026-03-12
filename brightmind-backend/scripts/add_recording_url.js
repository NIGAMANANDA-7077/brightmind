const sequelize = require('../config/db');

(async () => {
  try {
    await sequelize.authenticate();
    const [cols] = await sequelize.query('SHOW COLUMNS FROM live_classes LIKE \'recordingUrl\'');
    if (cols.length === 0) {
      await sequelize.query('ALTER TABLE live_classes ADD COLUMN recordingUrl VARCHAR(500) NULL');
      console.log('SUCCESS: recordingUrl column added');
    } else {
      console.log('INFO: recordingUrl column already exists — nothing to do');
    }
    const [allCols] = await sequelize.query('SHOW COLUMNS FROM live_classes');
    console.log('Columns:', allCols.map(c => c.Field).join(', '));
    await sequelize.close();
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exitCode = 1;
  }
})();
