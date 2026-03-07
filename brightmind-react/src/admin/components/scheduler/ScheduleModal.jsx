import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Save, Trash2, ExternalLink } from 'lucide-react';
import { useAdminScheduler } from '../../context/AdminSchedulerContext';
import { useAdminExams } from '../../context/AdminExamContext';
import { useNavigate } from 'react-router-dom';

const ScheduleModal = ({ isOpen, onClose, selectedDate, selectedEvent }) => {
    const { addSchedule, updateSchedule, deleteSchedule } = useAdminScheduler();
    const { exams } = useAdminExams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        examId: '',
        title: '',
        course: '',
        batch: '',
        date: '',
        time: '10:00',
        duration: 60,
        status: 'Draft'
    });

    useEffect(() => {
        if (selectedEvent) {
            setFormData(selectedEvent);
        } else if (selectedDate) {
            // Offset for timezone to ensure correct date string
            const offsetDate = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000));
            setFormData({
                examId: '',
                title: '',
                course: '',
                batch: '',
                date: offsetDate.toISOString().split('T')[0],
                time: '10:00',
                duration: 60,
                status: 'Draft'
            });
        }
    }, [selectedEvent, selectedDate, isOpen]);

    const handleExamSelect = (e) => {
        const examId = e.target.value;
        if (!examId) return;

        const selectedExam = exams.find(ex => ex.id.toString() === examId);
        if (selectedExam) {
            setFormData(prev => ({
                ...prev,
                examId: selectedExam.id,
                title: selectedExam.title,
                course: selectedExam.course,
                duration: selectedExam.timeLimit,
                status: 'Scheduled'
            }));
        }
    };

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedEvent) {
            updateSchedule(selectedEvent.id, formData);
        } else {
            addSchedule(formData);
        }
        onClose();
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this schedule?')) {
            deleteSchedule(selectedEvent.id);
            onClose();
        }
    };

    const handleEditExam = () => {
        if (formData.examId) {
            navigate(`/admin/exams/edit/${formData.examId}`);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">
                        {selectedEvent ? 'Edit Schedule' : 'Schedule New Exam'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Select Exam</label>
                        <div className="flex gap-2">
                            <select
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium"
                                value={formData.examId || ''}
                                onChange={handleExamSelect}
                                disabled={selectedEvent} // Disable changing exam on edit if desired, or allow it
                            >
                                <option value="">-- Choose from Created Exams --</option>
                                {exams.map(exam => (
                                    <option key={exam.id} value={exam.id}>
                                        {exam.title} ({exam.course})
                                    </option>
                                ))}
                            </select>
                            {formData.examId && (
                                <button
                                    type="button"
                                    onClick={handleEditExam}
                                    className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                                    title="Go to Exam Builder"
                                >
                                    <ExternalLink size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Exam Title (Auto-filled)</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none text-gray-500 cursor-not-allowed"
                            placeholder="Select an exam above..."
                            value={formData.title}
                            readOnly
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Course</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none text-gray-500"
                                value={formData.course}
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Batch</label>
                            <select
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
                                value={formData.batch}
                                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                            >
                                <option value="">Select Batch</option>
                                <option value="Batch A">Batch A</option>
                                <option value="Batch B">Batch B</option>
                                <option value="All Batches">All Batches</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="date"
                                    required
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Start Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="time"
                                    required
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Duration (min)</label>
                            <input
                                type="number"
                                min="10"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Status</label>
                            <select
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="Draft">Draft</option>
                                <option value="Scheduled">Scheduled</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        {selectedEvent && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                        <button
                            type="submit"
                            className="flex-1 flex items-center justify-center gap-2 bg-[#8b5cf6] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#7c3aed] transition-colors shadow-lg shadow-purple-500/20"
                        >
                            <Save size={20} /> {selectedEvent ? 'Update' : 'Schedule Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScheduleModal;
