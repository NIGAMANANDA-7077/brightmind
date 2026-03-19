import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';
import {
    ClipboardList, Plus, X, Check, ChevronDown, ChevronUp,
    Star, Search, Calendar, Users, Trash2
} from 'lucide-react';
import { useBatch } from '../../context/BatchContext';

const statusBadge = (status) => {
    const map = {
        Graded: 'bg-green-100 text-green-700',
        Submitted: 'bg-blue-100 text-blue-600',
        Late: 'bg-orange-100 text-orange-600',
        Pending: 'bg-gray-100 text-gray-500',
    };
    return (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${map[status] || 'bg-gray-100 text-gray-400'}`}>
            {status === 'Graded' && <Check size={10} />}
            {status}
        </span>
    );
};

const Assignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [gradeInputs, setGradeInputs] = useState({});
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ title: '', batchId: '', description: '', deadline: '', totalMarks: '', allowLateSubmission: false });
    const [formError, setFormError] = useState('');
    const [loading, setLoading] = useState(true);
    const [feedbackInputs, setFeedbackInputs] = useState({});
    const [deleteConfirm, setDeleteConfirm] = useState(null); // assignment object to delete

    const { myBatches } = useBatch(); // Get teacher's active batches

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const res = await api.get('/assignments');
            const data = res.data.map(a => ({ ...a, submissions: a.submissions || [] }));
            setAssignments(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissions = async (id) => {
        try {
            const res = await api.get(`/assignments/${id}/submissions`);
            setAssignments(prev => prev.map(a => a.id === id ? { ...a, submissions: res.data } : a));
        } catch (err) {
            console.error(err);
        }
    };

    const handleExpand = (id) => {
        if (expandedId === id) {
            setExpandedId(null);
        } else {
            setExpandedId(id);
            fetchSubmissions(id); // Fetch submissions when expanding
        }
    };

    const filtered = assignments.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        (a.courseName && a.courseName.toLowerCase().includes(search.toLowerCase())) ||
        (a.batch?.batchName && a.batch.batchName.toLowerCase().includes(search.toLowerCase()))
    );

    const handleCreate = async () => {
        if (!form.title || !form.batchId || !form.deadline || !form.totalMarks) { 
            setFormError('All fields are required.'); 
            return; 
        }
        
        try {
            const selectedBatch = myBatches.find(b => b.id === form.batchId);
            const courseId = selectedBatch?.course?.id || selectedBatch?.courseId;
            const courseName = selectedBatch?.course?.title || 'Unknown Course';

            const res = await api.post('/assignments', {
                title: form.title,
                courseId: courseId,
                courseName: courseName,
                batchId: form.batchId,
                deadline: form.deadline,
                totalMarks: Number(form.totalMarks),
                description: form.description,
                allowLateSubmission: form.allowLateSubmission
            });

            const newAssignment = {
                ...res.data,
                batch: { id: form.batchId, batchName: selectedBatch?.batchName },
                submissions: []
            };

            setAssignments(prev => [newAssignment, ...prev]);
            setForm({ title: '', batchId: '', description: '', deadline: '', totalMarks: '', allowLateSubmission: false });
            setFormError('');
            setShowCreate(false);
        } catch (err) {
            setFormError(err.response?.data?.message || 'Error creating assignment');
        }
    };

    const saveGrade = async (assignmentId, studentId, totalMarks) => {
        const key = `${assignmentId}-${studentId}`;
        const val = Number(gradeInputs[key]);
        if (isNaN(val) || val < 0 || val > totalMarks) return;

        try {
            await api.put(`/assignments/${assignmentId}/grade`, {
                studentId,
                grade: val,
                feedback: feedbackInputs[key] || ''
            });
            
            // local update
            setAssignments(prev => prev.map(a => {
                if (a.id !== assignmentId) return a;
                return { ...a, submissions: a.submissions.map(s => s.studentId === studentId ? { ...s, grade: val, feedback: feedbackInputs[key], status: 'Graded' } : s) };
            }));
        } catch (err) {
            console.error("Error saving grade", err);
            alert("Failed to save grade");
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await api.delete(`/assignments/${deleteConfirm.id}`);
            setAssignments(prev => prev.filter(a => a.id !== deleteConfirm.id));
            if (expandedId === deleteConfirm.id) setExpandedId(null);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete assignment');
        } finally {
            setDeleteConfirm(null);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
                    <p className="text-gray-500">Create and manage assignments for your batches</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 bg-[#8b5cf6] text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#7c3aed] transition-colors self-start sm:self-auto"
                >
                    <Plus size={18} /> Create Assignment
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search by title, course, or batch..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium"
                />
            </div>

            {/* Assignments Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Assignment</th>
                                <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Batch</th>
                                <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Deadline</th>
                                <th className="py-4 px-6 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Marks</th>
                                <th className="py-4 px-6 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && assignments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center text-gray-500">Loading assignments...</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center text-gray-500">No assignments found</td>
                                </tr>
                            ) : filtered.map(a => {
                                const isOpen = expandedId === a.id;
                                const isOverdue = new Date(a.deadline) < new Date();

                                return (
                                    <React.Fragment key={a.id}>
                                        <tr className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-[#8b5cf6]/10 rounded-lg">
                                                        <ClipboardList size={16} className="text-[#8b5cf6]" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{a.title}</p>
                                                        <p className="text-xs text-gray-500">{a.courseName?.split('—')[0]?.trim() || 'No Course'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <p className="text-sm text-gray-600 font-bold">{a.batch?.batchName || 'Global'}</p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar size={14} className={isOverdue ? 'text-red-400' : 'text-gray-400'} />
                                                    <span className={`font-medium ${isOverdue ? 'text-red-500' : 'text-gray-600'}`}>{a.deadline}</span>
                                                </div>
                                                {isOverdue && <p className="text-xs text-red-400 mt-0.5">Overdue</p>}
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className="font-bold text-gray-900 text-sm">{a.totalMarks}</span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleExpand(a.id)}
                                                        className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                                                    >
                                                        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                        {isOpen ? 'Close' : 'View Submissions'}
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirm(a)}
                                                        className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 border border-red-100"
                                                    >
                                                        <Trash2 size={13} /> Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {/* Expanded Submissions */}
                                        {isOpen && (
                                            <tr>
                                                <td colSpan={5} className="p-0 bg-gray-50/50">
                                                    <div className="px-6 py-4">
                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Student Submissions</p>
                                                        {(!a.submissions || a.submissions.length === 0) ? (
                                                            <p className="text-sm text-gray-400 py-3 text-center">No submissions received yet</p>
                                                        ) : (
                                                            <>
                                                            {/* Analytics summary */}
                                                            {(() => {
                                                                const total = a.submissions.length;
                                                                const submitted = a.submissions.filter(s => s.status === 'Submitted' || s.status === 'Late').length;
                                                                const graded = a.submissions.filter(s => s.status === 'Graded').length;
                                                                const gradedSubs = a.submissions.filter(s => s.status === 'Graded' && s.grade != null);
                                                                const avg = gradedSubs.length > 0 ? (gradedSubs.reduce((acc, s) => acc + s.grade, 0) / gradedSubs.length).toFixed(1) : null;
                                                                return (
                                                                    <div className="flex gap-3 mb-4 flex-wrap">
                                                                        <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-center min-w-[60px]"><p className="text-xs text-gray-400">Total</p><p className="font-bold text-gray-800">{total}</p></div>
                                                                        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-center min-w-[70px]"><p className="text-xs text-blue-400">Submitted</p><p className="font-bold text-blue-700">{submitted}</p></div>
                                                                        <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-2 text-center min-w-[60px]"><p className="text-xs text-green-400">Graded</p><p className="font-bold text-green-700">{graded}</p></div>
                                                                        <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-center min-w-[60px]"><p className="text-xs text-gray-400">Pending</p><p className="font-bold text-gray-700">{Math.max(0, total - submitted - graded)}</p></div>
                                                                        {avg && <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-2 text-center min-w-[80px]"><p className="text-xs text-yellow-400">Avg Score</p><p className="font-bold text-yellow-700">{avg}/{a.totalMarks}</p></div>}
                                                                    </div>
                                                                );
                                                            })()}
                                                            <div className="overflow-x-auto">
                                                                <table className="w-full text-sm">
                                                                    <thead>
                                                                        <tr className="text-left text-xs text-gray-400 border-b border-gray-200">
                                                                            <th className="pb-2 pr-4">Student</th>
                                                                            <th className="pb-2 pr-4">Submission</th>
                                                                            <th className="pb-2 pr-4">Submitted At</th>
                                                                            <th className="pb-2 pr-4">Status</th>
                                                                            <th className="pb-2 pr-4">Grade / Feedback</th>
                                                                            <th className="pb-2">Action</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-gray-100">
                                                                        {a.submissions.map(s => {
                                                                            const key = `${a.id}-${s.studentId}`;
                                                                            return (
                                                                                <tr key={s.studentId} className="hover:bg-white transition-colors">
                                                                                    <td className="py-2.5 pr-4 font-medium text-gray-800">{s.studentName || s.student?.name || 'Unknown'}</td>
                                                                                    <td className="py-2.5 pr-4 text-xs">
                                                                                        {s.fileUrl ? (() => {
                                                                                            const ext = s.fileUrl.split('.').pop()?.toLowerCase();
                                                                                            const icon = ['jpg','jpeg','png','gif','webp'].includes(ext) ? '🖼️'
                                                                                                : ext === 'pdf' ? '📄'
                                                                                                : ['zip','rar'].includes(ext) ? '🗜️'
                                                                                                : ['doc','docx'].includes(ext) ? '📝'
                                                                                                : ['xls','xlsx'].includes(ext) ? '📊'
                                                                                                : '📎';
                                                                                            // Extract readable filename
                                                                                            const rawName = s.fileUrl.split('/').pop();
                                                                                            const displayName = rawName.replace(/^file-\d+-\d+\./, '').substring(0, 25);
                                                                                            return (
                                                                                                <a href={s.fileUrl} target="_blank" rel="noreferrer"
                                                                                                    className="inline-flex items-center gap-1 text-[#8b5cf6] hover:text-[#7c3aed] font-medium hover:underline"
                                                                                                    title={rawName}
                                                                                                >
                                                                                                    {icon} {displayName}
                                                                                                </a>
                                                                                            );
                                                                                        })() : s.content ? (
                                                                                            <span className="text-gray-600 italic line-clamp-2 max-w-[200px]">{s.content}</span>
                                                                                        ) : <span className="text-gray-300">—</span>}
                                                                                    </td>
                                                                                    <td className="py-2.5 pr-4 text-gray-400 text-xs">
                                                                                        {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : <span className="text-yellow-500">Pending</span>}
                                                                                    </td>
                                                                                    <td className="py-2.5 pr-4">{statusBadge(s.status)}</td>
                                                                                    <td className="py-2.5 pr-4">
                                                                                        {s.status === 'Graded' ? (
                                                                                            <div>
                                                                                                <span className="flex items-center gap-1 font-bold text-green-700">
                                                                                                    <Star size={13} className="text-yellow-400 fill-yellow-400" /> {s.grade}/{a.totalMarks}
                                                                                                </span>
                                                                                                {s.feedback && <p className="text-xs text-gray-400 mt-0.5 italic">{s.feedback}</p>}
                                                                                            </div>
                                                                                        ) : (s.status === 'Submitted' || s.status === 'Late') ? (
                                                                                            <div className="space-y-1">
                                                                                                <input type="number" min={0} max={a.totalMarks}
                                                                                                    placeholder={`0–${a.totalMarks}`}
                                                                                                    className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-[#8b5cf6]/30"
                                                                                                    value={gradeInputs[key] ?? ''}
                                                                                                    onChange={e => setGradeInputs(prev => ({ ...prev, [key]: e.target.value }))}
                                                                                                />
                                                                                                <input type="text"
                                                                                                    placeholder="Feedback (optional)"
                                                                                                    className="w-full border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-[#8b5cf6]/30"
                                                                                                    value={feedbackInputs[key] ?? ''}
                                                                                                    onChange={e => setFeedbackInputs(prev => ({ ...prev, [key]: e.target.value }))}
                                                                                                />
                                                                                            </div>
                                                                                        ) : <span className="text-gray-300 text-xs">—</span>}
                                                                                    </td>
                                                                                    <td className="py-2.5">
                                                                                        {(s.status === 'Submitted' || s.status === 'Late') && (
                                                                                            <button
                                                                                                onClick={() => saveGrade(a.id, s.studentId, a.totalMarks)}
                                                                                                className="text-xs font-bold text-[#8b5cf6] bg-[#8b5cf6]/10 px-3 py-1 rounded-lg hover:bg-[#8b5cf6]/20 transition-colors flex items-center gap-1"
                                                                                            >
                                                                                                <Check size={12} /> Publish Grade
                                                                                            </button>
                                                                                        )}
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900 text-lg">Create Assignment</h3>
                            <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            {formError && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Assignment Title</label>
                                <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/20" placeholder="e.g. Newton's Laws Problems" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Assign to Batch</label>
                                <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/20" value={form.batchId} onChange={e => setForm(p => ({ ...p, batchId: e.target.value }))}>
                                    <option value="">Select a batch</option>
                                    {myBatches.map(b => <option key={b.id} value={b.id}>{b.batchName} ({b.course?.title})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
                                <textarea rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 resize-none" placeholder="Assignment instructions..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Deadline</label>
                                    <input type="date" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/20" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Total Marks</label>
                                    <input type="number" min={1} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/20" placeholder="50" value={form.totalMarks} onChange={e => setForm(p => ({ ...p, totalMarks: e.target.value }))} />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="allowLate" checked={form.allowLateSubmission} onChange={e => setForm(p => ({ ...p, allowLateSubmission: e.target.checked }))} className="w-4 h-4 accent-[#8b5cf6]" />
                                <label htmlFor="allowLate" className="text-sm text-gray-600 font-medium">Allow Late Submission</label>
                            </div>
                        </div>
                        <div className="flex gap-3 p-5 border-t border-gray-100">
                            <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">Cancel</button>
                            <button onClick={handleCreate} className="flex-1 py-2.5 rounded-xl bg-[#8b5cf6] text-white text-sm font-bold hover:bg-[#7c3aed] flex items-center justify-center gap-2">
                                <Plus size={16} /> Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
                        <div className="p-6 text-center">
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={24} className="text-red-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-2">Delete Assignment?</h3>
                            <p className="text-gray-500 text-sm mb-1">
                                <span className="font-semibold text-gray-700">"{deleteConfirm.title}"</span>
                            </p>
                            <p className="text-gray-400 text-sm mb-6">
                                This will permanently delete the assignment and all student submissions. This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Trash2 size={15} /> Delete Assignment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Assignments;
