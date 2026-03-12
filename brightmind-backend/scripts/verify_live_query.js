const sequelize = require('../config/db');
const LiveClass = require('../models/LiveClass');
const Course = require('../models/Course');
const User = require('../models/User');
require('../models/associations');

(async () => {
  try {
    await sequelize.authenticate();
    const rows = await LiveClass.findAll({
      include: [
        { model: Course, as: 'course', attributes: ['id', 'title'] },
        { model: User, as: 'teacher', attributes: ['id', 'name', 'avatar'] }
      ],
      order: [['classDate', 'ASC'], ['startTime', 'ASC']],
      limit: 5
    });
    console.log('QUERY OK — rows:', rows.length);
    if (rows.length > 0) {
      const r = rows[0].toJSON();
      console.log('Sample:', JSON.stringify({
        id: r.id, title: r.title, classDate: r.classDate,
        startTime: r.startTime, status: r.status,
        recordingUrl: r.recordingUrl,
        course: r.course, teacher: r.teacher
      }, null, 2));
    }
    await sequelize.close();
    console.log('DONE');
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exitCode = 1;
  }
})();
