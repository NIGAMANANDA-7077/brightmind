const { sequelize } = require('../config/db');
const Lesson = require('../models/Lesson');
const { v4: uuidv4 } = require('uuid');

async function addVideoLesson() {
    try {
        const moduleId = 'dd70f486-5e6f-43dc-8cdb-fff48f1c24ed'; // Module in Advanced Web Development
        const videoUrl = 'https://www.youtube.com/embed/_cl4gIpfjq0?si=ryeDJe3Oft5nDClO';
        
        console.log('Adding new video lesson...');
        
        await Lesson.create({
            id: uuidv4(),
            moduleId: moduleId,
            lessonTitle: 'Mastering React Patterns (New)',
            lessonOrder: 5,
            type: 'video',
            videoUrl: videoUrl,
            duration: '10:00'
        });

        console.log('Lesson added successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error adding lesson:', err);
        process.exit(1);
    }
}

addVideoLesson();
