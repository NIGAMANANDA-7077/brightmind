import React, { useState, useEffect } from 'react';
import api from '../../../utils/axiosConfig';
import { Plus, Trash2, CheckCircle, Clock, FileQuestion, Loader2, BookOpen } from 'lucide-react';
import ExamQuestionsModal from './ExamQuestionsModal';

const ExamsTab = ({ courses, batches }) => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [questionsExam, setQuestionsExam] = useState(null); // exam to open in questions modal

    // Create Exam form
    const [form, setForm] = useState({
        title: '', courseId: '', batchId: 'ALL', examType: 'Quiz',
        duration: 60, totalMarks: 100, passingMarks: 33, startTime: '', endTime: ''
    });

    // Batches filtered to the selected course
    const courseBatches = form.courseId
        ? batches.filter(b => (b.courseId || b.course?.id) === form.courseId)
        : [];

    const fetchExams = async () => {
        setLoading(true);
        try {
            const res = await api.get('/exams/teacher');
            setExams(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchExams(); }, []);

    const handleSaveExam = async () => {
        if (!form.title.trim()) return alert('Exam title is required');
        if (!form.courseId) return alert('Please select a course first');
        // Validate batch belongs to selected course
        if (form.batchId && form.batchId !== 'ALL') {
            const selectedBatch = batches.find(b => String(b.id) === String(form.batchId));
            const batchCourseId = selectedBatch?.courseId || selectedBatch?.course?.id;
            if (batchCourseId && String(batchCourseId) !== String(form.courseId)) {
                return alert('Selected batch does not belong to the selected course. Please choose a valid batch.');
            }
        }
        const payload = {
            ...form,
            batchId: form.batchId === 'ALL' ? null : form.batchId
        };
        try {
            await api.post('/exams', payload);
            setShowModal(false);
            setForm({ title: '', courseId: '', batchId: 'ALL', examType: 'Quiz', duration: 60, totalMarks: 100, passingMarks: 33, startTime: '', endTime: '' });
            fetchExams();
        } catch (err) {
            console.error(err);
            alert('Failed to create exam');
        }
    };

    const handleToggleStatus = async (exam) => {
        const newStatus = exam.status === 'Active' ? 'Draft' : 'Active';
        try {
            await api.patch(`/exams/${exam.id}/status`, { status: newStatus });
            fetchExams();
        } catch (err) {
            console.error(err);
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this exam? All related data will be removed.')) return;
        try {
            await api.delete(`/exams/${id}`);
            fetchExams();
        } catch (err) {
            console.error(err);
        }
    };

    const getStatusChip = (status) => {
        switch (status) {
            case 'Active': return <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={10} /> Published</span>;
            case 'Draft': return <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock size={10} /> Draft</span>;
            case 'Completed': return <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold w-fit">Completed</span>;
            default: return <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold w-fit">{status}</span>;
        }
    };

    if (loading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-purple-500" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800">My Exams</h3>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-[#8b5cf6] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#7c3aed] transition-colors shadow-lg shadow-purple-500/20"
                >
                    <Plus size={18} /> Create Exam
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 font-bold text-sm text-gray-600">
                        <tr>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Batch</th>
                            <th className="px-6 py-4">Duration / Marks</th>
                            <th className="px-6 py-4">Questions</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {exams.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-10 text-gray-400">No exams yet. Click "Create Exam" to get started.</td></tr>
                        ) : exams.map(exam => (
                            <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-900">{exam.title}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{exam.batch?.batchName || exam.batch?.name || <span className="text-purple-500 font-semibold">All Batches</span>}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{exam.duration}m / {exam.totalMarks} pts</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{exam.examQuestions?.length || 0} Qs</td>
                                <td className="px-6 py-4">{getStatusChip(exam.status)}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setQuestionsExam(exam)}
                                            className="text-xs font-bold text-[#8b5cf6] bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors flex items-center gap-1"
                                        >
                                            <FileQuestion size={13} /> Questions
                                        </button>
                                        {exam.status !== 'Completed' && (
                                            <button
                                                onClick={() => handleToggleStatus(exam)}
                                                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1 ${
                                                    exam.status === 'Active'
                                                        ? 'text-orange-600 bg-orange-50 border-orange-100 hover:bg-orange-100'
                                                        : 'text-green-600 bg-green-50 border-green-100 hover:bg-green-100'
                                                }`}
                                            >
                                                {exam.status === 'Active' ? <><Clock size={13} /> Unpublish</> : <><CheckCircle size={13} /> Publish</>}
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(exam.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Exam Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Create New Exam</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Exam Title <span className="text-red-500">*</span></label>
                                <input
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/20"
                                    placeholder="e.g. Midterm Math Quiz"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Course <span className="text-red-500">*</span></label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/20"
                                        value={form.courseId}
                                        onChange={e => setForm({ ...form, courseId: e.target.value, batchId: 'ALL' })}
                                    >
                                        <option value="">Select Course...</option>
                                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Batch <span className="text-red-500">*</span></label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/20"
                                        value={form.batchId}
                                        disabled={!form.courseId}
                                        onChange={e => setForm({ ...form, batchId: e.target.value })}
                                    >
                                        <option value="ALL">All Batches (this course)</option>
                                        {courseBatches.map(b => <option key={b.id} value={b.id}>{b.batchName}</option>)}
                                    </select>
                                    {form.courseId && courseBatches.length === 0 && (
                                        <p className="text-xs text-orange-500 mt-1">No batches found for this course.</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Duration (mins)</label>
                                    <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" value={form.duration} onChange={e => setForm({ ...form, duration: parseInt(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Exam Type</label>
                                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" value={form.examType} onChange={e => setForm({ ...form, examType: e.target.value })}>
                                        <option value="Quiz">Quiz</option>
                                        <option value="Practice Test">Practice Test</option>
                                        <option value="Mid Exam">Mid Exam</option>
                                        <option value="Final Exam">Final Exam</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Total Marks</label>
                                    <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" value={form.totalMarks} onChange={e => setForm({ ...form, totalMarks: parseInt(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Passing Marks</label>
                                    <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" value={form.passingMarks} onChange={e => setForm({ ...form, passingMarks: parseInt(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Exam Start Date & Time</label>
                                    <input type="datetime-local" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/20" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Exam End Date & Time</label>
                                    <input type="datetime-local" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/20" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 bg-blue-50 border border-blue-100 rounded-xl p-3">
                                💡 After creating, use the <strong>Questions</strong> button to add questions. Then click <strong>Publish</strong> to make it visible to students.
                            </p>
                        </div>
                        <div className="p-6 bg-gray-50 flex gap-3">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-3 font-bold text-gray-600 bg-white border border-gray-200 rounded-xl">Cancel</button>
                            <button onClick={handleSaveExam} className="flex-1 py-3 font-bold text-white bg-[#8b5cf6] rounded-xl hover:bg-[#7c3aed]">Save as Draft</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Questions Management Modal */}
            {questionsExam && (
                <ExamQuestionsModal
                    exam={questionsExam}
                    onClose={() => { setQuestionsExam(null); fetchExams(); }}
                />
            )}
        </div>
    );
};

export default ExamsTab;
