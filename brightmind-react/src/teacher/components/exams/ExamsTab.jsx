import React, { useState, useEffect } from 'react';
import api from '../../../utils/axiosConfig';
import { Plus, Edit, Trash2, Calendar, CheckCircle, Clock, FileText, UploadCloud, FileQuestion, Loader2 } from 'lucide-react';

const ExamsTab = ({ courses, batches }) => {
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);
    const [generating, setGenerating] = useState(false);

    // Form states
    const [form, setForm] = useState({
        title: '', description: '', courseId: '', batchId: '', examType: 'Quiz',
        duration: 60, totalMarks: 100, passingMarks: 33, negativeMarking: false,
        randomizeQuestions: true, randomizeOptions: true, startTime: '', endTime: ''
    });

    const [genForm, setGenForm] = useState({ easyCount: 5, mediumCount: 10, hardCount: 5 });

    const fetchExams = async () => {
        setLoading(true);
        try {
            const userData = JSON.parse(localStorage.getItem('brightmind_user'));
            const res = await api.get(`/exams/teacher`);
            setExams(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const handleSaveExam = async () => {
        try {
            const payload = { ...form };
            if (!payload.batchId) delete payload.batchId;
            if (!payload.startTime) delete payload.startTime;
            if (!payload.endTime) delete payload.endTime;

            await api.post('/exams', payload);
            setShowModal(false);
            fetchExams();
        } catch (err) {
            console.error(err);
            alert('Failed to create exam');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this exam?")) return;
        try {
            await api.delete(`/exams/${id}`);
            fetchExams();
        } catch (err) {
            console.error(err);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            await api.post(`/exams/${selectedExam.id}/generate`, genForm);
            alert("Random paper generated successfully!");
            setShowGenerateModal(false);
        } catch (err) {
            console.error(err);
            alert('Failed to generate paper. Ensure enough questions exist in the bank.');
        } finally {
            setGenerating(false);
        }
    };

    const getStatusChip = (status) => {
        switch (status) {
            case 'Active': return <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={10} /> Active</span>;
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
                    onClick={() => {
                        setForm({...form, courseId: courses[0]?.id || ''});
                        setShowModal(true);
                    }}
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
                            <th className="px-6 py-4">Course</th>
                            <th className="px-6 py-4">Duration/Marks</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {exams.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-8 text-gray-400">No exams created yet.</td></tr>
                        ) : exams.map(exam => (
                            <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-900">{exam.title}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{exam.course?.title || 'Unknown'}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{exam.duration}m / {exam.totalMarks}m</td>
                                <td className="px-6 py-4">{getStatusChip(exam.status)}</td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    <button 
                                        onClick={() => { setSelectedExam(exam); setShowGenerateModal(true); }}
                                        className="text-xs font-bold text-[#8b5cf6] bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors flex items-center gap-1"
                                    >
                                        <FileQuestion size={14} /> Generate Paper
                                    </button>
                                    <button onClick={() => handleDelete(exam.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create Exam Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Create New Exam Structure</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">✕</button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4 flex-1">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                                <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" placeholder="Midterm Math 2026" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Course</label>
                                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" value={form.courseId} onChange={e => setForm({...form, courseId: e.target.value})}>
                                        <option value="">Select Course...</option>
                                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Batch (Optional)</label>
                                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" value={form.batchId} onChange={e => setForm({...form, batchId: e.target.value})}>
                                        <option value="">All Batches</option>
                                        {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Duration (mins)</label>
                                    <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" value={form.duration} onChange={e => setForm({...form, duration: parseInt(e.target.value)})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Exam Type</label>
                                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" value={form.examType} onChange={e => setForm({...form, examType: e.target.value})}>
                                        <option value="Quiz">Quiz</option>
                                        <option value="Practice Test">Practice Test</option>
                                        <option value="Mid Exam">Mid Exam</option>
                                        <option value="Final Exam">Final Exam</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Total Marks</label>
                                    <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" value={form.totalMarks} onChange={e => setForm({...form, totalMarks: parseInt(e.target.value)})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Passing Marks</label>
                                    <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" value={form.passingMarks} onChange={e => setForm({...form, passingMarks: parseInt(e.target.value)})} />
                                </div>
                            </div>
                            
                            <div className="flex gap-4 bg-purple-50 p-4 rounded-xl border border-purple-100">
                                <label className="flex items-center gap-2 font-bold text-sm text-purple-900">
                                    <input type="checkbox" checked={form.negativeMarking} onChange={e => setForm({...form, negativeMarking: e.target.checked})} className="w-4 h-4" />
                                    Negative Marking
                                </label>
                                <label className="flex items-center gap-2 font-bold text-sm text-purple-900">
                                    <input type="checkbox" checked={form.randomizeQuestions} onChange={e => setForm({...form, randomizeQuestions: e.target.checked})} className="w-4 h-4" />
                                    Randomize Questions
                                </label>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 flex gap-3">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-3 font-bold text-gray-600 bg-white border border-gray-200 rounded-xl">Cancel</button>
                            <button onClick={handleSaveExam} className="flex-1 py-3 font-bold text-white bg-[#8b5cf6] rounded-xl">Save Exam Base</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Generate Paper Modal */}
            {showGenerateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-zoomIn">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Auto-Generate Paper</h3>
                                <p className="text-xs text-gray-500 mt-1">Exam: {selectedExam?.title}</p>
                            </div>
                            <button onClick={() => setShowGenerateModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-600 font-medium mb-4">How many questions of each difficulty should we pull from the Question Bank?</p>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Easy</label>
                                    <input type="number" className="w-full bg-green-50 border border-green-200 rounded-xl px-3 py-2 outline-none text-center" value={genForm.easyCount} onChange={e => setGenForm({...genForm, easyCount: parseInt(e.target.value)})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Medium</label>
                                    <input type="number" className="w-full bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2 outline-none text-center" value={genForm.mediumCount} onChange={e => setGenForm({...genForm, mediumCount: parseInt(e.target.value)})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Hard</label>
                                    <input type="number" className="w-full bg-red-50 border border-red-200 rounded-xl px-3 py-2 outline-none text-center" value={genForm.hardCount} onChange={e => setGenForm({...genForm, hardCount: parseInt(e.target.value)})} />
                                </div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-center mt-4">
                                <span className="font-bold text-gray-800">Total Questions: {genForm.easyCount + genForm.mediumCount + genForm.hardCount}</span>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 flex gap-3">
                            <button onClick={() => setShowGenerateModal(false)} className="flex-1 py-3 font-bold text-gray-600 bg-white border border-gray-200 rounded-xl">Cancel</button>
                            <button onClick={handleGenerate} disabled={generating} className="flex-1 py-3 font-bold text-white bg-[#8b5cf6] rounded-xl flex items-center justify-center gap-2">
                                {generating ? <Loader2 className="animate-spin w-5 h-5" /> : 'Generate Now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ExamsTab;
