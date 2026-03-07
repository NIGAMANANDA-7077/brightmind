import React, { useState } from 'react';
import { teacherAssignments, teacherCourses } from '../data/teacherMock';
import {
    ClipboardList, Plus, X, Check, ChevronDown, ChevronUp,
    Star, Search, Calendar, Clock, Users
} from 'lucide-react';

// =========================================================
// Teacher Assignments — Admin-style table layout
// =========================================================

const statusBadge = (status) => {
    const map = {
        Graded: 'bg-green-100 text-green-700',
        Submitted: 'bg-blue-100 text-blue-600',
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
    const [assignments, setAssignments] = useState(teacherAssignments);
    const [expandedId, setExpandedId] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [gradeInputs, setGradeInputs] = useState({});
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ title: '', courseId: '', deadline: '', totalMarks: '' });
    const [formError, setFormError] = useState('');

    const filtered = assignments.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.courseName.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreate = () => {
        if (!form.title || !form.courseId || !form.deadline || !form.totalMarks) { setFormError('All fields are required.'); return; }
        const course = teacherCourses.find(c => c.id === form.courseId);
        setAssignments(prev => [{
            id: `A${Date.now()}`, title: form.title,
            courseId: form.courseId, courseName: course?.title || '',
            deadline: form.deadline, totalMarks: Number(form.totalMarks), submissions: [],
        }, ...prev]);
        setForm({ title: '', courseId: '', deadline: '', totalMarks: '' });
        setFormError(''); setShowCreate(false);
    };

    const saveGrade = (assignmentId, studentId, totalMarks) => {
        const key = `${assignmentId}-${studentId}`;
        const val = Number(gradeInputs[key]);
        if (isNaN(val) || val < 0 || val > totalMarks) return;
        setAssignments(prev => prev.map(a => {
            if (a.id !== assignmentId) return a;
            return { ...a, submissions: a.submissions.map(s => s.studentId === studentId ? { ...s, grade: val, status: 'Graded' } : s) };
        }));
    };

    return (
        <div className="space-y-6 animate-fadeIn pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
                    <p className="text-gray-500">Create and manage assignments across your courses</p>
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
                    placeholder="Search assignments or courses..."
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
                                <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Course</th>
                                <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Deadline</th>
                                <th className="py-4 px-6 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Marks</th>
                                <th className="py-4 px-6 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Submissions</th>
                                <th className="py-4 px-6 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map(a => {
                                const subCount = a.submissions.filter(s => s.status !== 'Pending').length;
                                const gradedCount = a.submissions.filter(s => s.status === 'Graded').length;
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
                                                        <p className="text-xs text-gray-400">{a.totalMarks} marks total</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <p className="text-sm text-gray-600 font-medium">{a.courseName.split('—')[0].trim()}</p>
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
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex items-center justify-center gap-2 text-xs">
                                                    <span className="bg-blue-50 text-blue-600 font-bold px-2 py-1 rounded-full">{subCount} sub.</span>
                                                    <span className="bg-green-50 text-green-600 font-bold px-2 py-1 rounded-full">{gradedCount} graded</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => setExpandedId(isOpen ? null : a.id)}
                                                    className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ml-auto"
                                                >
                                                    {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                    {isOpen ? 'Close' : 'View'}
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Expanded Submissions */}
                                        {isOpen && (
                                            <tr>
                                                <td colSpan={6} className="p-0 bg-gray-50/50">
                                                    <div className="px-6 py-4">
                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Student Submissions</p>
                                                        {a.submissions.length === 0 ? (
                                                            <p className="text-sm text-gray-400 py-3 text-center">No submissions received yet</p>
                                                        ) : (
                                                            <div className="overflow-x-auto">
                                                                <table className="w-full text-sm">
                                                                    <thead>
                                                                        <tr className="text-left text-xs text-gray-400 border-b border-gray-200">
                                                                            <th className="pb-2 pr-4">Student</th>
                                                                            <th className="pb-2 pr-4">Submitted At</th>
                                                                            <th className="pb-2 pr-4">Status</th>
                                                                            <th className="pb-2 pr-4">Grade</th>
                                                                            <th className="pb-2">Action</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-gray-100">
                                                                        {a.submissions.map(s => {
                                                                            const key = `${a.id}-${s.studentId}`;
                                                                            return (
                                                                                <tr key={s.studentId} className="hover:bg-white transition-colors">
                                                                                    <td className="py-2.5 pr-4 font-medium text-gray-800">{s.studentName}</td>
                                                                                    <td className="py-2.5 pr-4 text-gray-400 text-xs">
                                                                                        {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : <span className="text-yellow-500">Pending</span>}
                                                                                    </td>
                                                                                    <td className="py-2.5 pr-4">{statusBadge(s.status)}</td>
                                                                                    <td className="py-2.5 pr-4">
                                                                                        {s.status === 'Graded' ? (
                                                                                            <span className="flex items-center gap-1 font-bold text-green-700">
                                                                                                <Star size={13} className="text-yellow-400 fill-yellow-400" /> {s.grade}/{a.totalMarks}
                                                                                            </span>
                                                                                        ) : s.status === 'Submitted' ? (
                                                                                            <input type="number" min={0} max={a.totalMarks}
                                                                                                placeholder={`0–${a.totalMarks}`}
                                                                                                className="w-20 border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-[#8b5cf6]/30"
                                                                                                value={gradeInputs[key] ?? ''}
                                                                                                onChange={e => setGradeInputs(prev => ({ ...prev, [key]: e.target.value }))}
                                                                                            />
                                                                                        ) : <span className="text-gray-300 text-xs">—</span>}
                                                                                    </td>
                                                                                    <td className="py-2.5">
                                                                                        {s.status === 'Submitted' && (
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
                {filtered.length === 0 && (
                    <div className="text-center py-14 text-gray-400">
                        <ClipboardList size={36} className="mx-auto mb-3 opacity-20" />
                        <p className="font-medium">No assignments found</p>
                    </div>
                )}
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
                                <label className="block text-xs font-bold text-gray-500 mb-1">Course</label>
                                <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/20" value={form.courseId} onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))}>
                                    <option value="">Select a course</option>
                                    {teacherCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                </select>
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
        </div>
    );
};

export default Assignments;
