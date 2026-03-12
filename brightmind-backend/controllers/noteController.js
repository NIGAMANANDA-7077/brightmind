const Note = require('../models/Note');

// Get note for a specific lesson (per student)
exports.getNote = async (req, res) => {
    try {
        const note = await Note.findOne({
            where: {
                studentId: req.user.id,
                lessonId: req.params.lessonId
            }
        });
        res.json(note || { content: '' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Save or update note for a lesson
exports.saveNote = async (req, res) => {
    try {
        const { content } = req.body;
        const [note, created] = await Note.findOrCreate({
            where: {
                studentId: req.user.id,
                lessonId: req.params.lessonId
            },
            defaults: { content }
        });

        if (!created) {
            await note.update({ content });
        }

        res.json(note);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete note for a lesson
exports.deleteNote = async (req, res) => {
    try {
        const note = await Note.findOne({
            where: {
                studentId: req.user.id,
                lessonId: req.params.lessonId
            }
        });
        if (!note) return res.status(404).json({ message: 'Note not found' });
        await note.destroy();
        res.json({ message: 'Note deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
