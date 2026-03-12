import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Users, BookOpen, UserCheck, X, Plus } from 'lucide-react';
import api from '../../utils/axiosConfig';

const BatchCreate = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState({
        batchName: '', courseId: '', teacherId: '',
        startDate: '', endDate: '', batchStatus: 'upcoming', description: ''
    });

    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [existingStudentIds, setExistingStudentIds] = useState([]);

    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState('');
    const [studentSearch, setStudentSearch] = useState('');

    useEffect(() => {
        const fetchAll = async () => {
            setDataLoading(true);
            try {
                const [cRes, uRes] = await Promise.all([
                    api.get('/courses'),
                    api.get('/users')
                ]);
                const cData = cRes.data;
                const uData = uRes.data;
                const users = Array.isArray(uData) ? uData : (uData.data || []);
                setCourses(Array.isArray(cData) ? cData : (cData.data || []));

                // Deduplicate teachers by id
                const teacherMap = new Map();
                users.filter(u => u.role === 'Teacher').forEach(t => teacherMap.set(t.id, t));
                setTeachers([...teacherMap.values()]);

                setAllStudents(users.filter(u => u.role === 'Student'));

                if (isEdit) {
                    const bRes = await api.get(`/batches/${id}`);
                    const bData = bRes.data;
                    if (bData.success && bData.data) {
                        const b = bData.data;
                        setForm({
                            batchName: b.batchName || '',
                            courseId: b.courseId || '',
                            teacherId: b.teacherId || '',
                            startDate: b.startDate || '',
                            endDate: b.endDate || '',
                            batchStatus: b.batchStatus || 'upcoming',
                            description: b.description || ''
                        });
                        const existingIds = (b.students || []).map(s => s.id);
                        setExistingStudentIds(existingIds);
                    }
                }
            } catch (e) {
                setError('Failed to load data: ' + (e.response?.data?.message || e.message));
            } finally {
                setDataLoading(false);
            }
        };
        fetchAll();
    }, [id]);

    const toggleStudent = (student) => {
        setSelectedStudents(prev =>
            prev.find(s => s.id === student.id)
                ? prev.filter(s => s.id !== student.id)
                : [...prev, student]
        );
    };

    const filteredStudents = allStudents.filter(s =>
        !existingStudentIds.includes(s.id) &&
        (s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
            s.email.toLowerCase().includes(studentSearch.toLowerCase()))
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let batchId;
            if (isEdit) {
                const res = await api.put(`/batches/${id}`, form);
                batchId = id;
            } else {
                const res = await api.post('/batches', form);
                batchId = res.data.data?.id;
            }

            if (selectedStudents.length > 0 && batchId) {
                await api.post(`/batches/${batchId}/students`, {
                    studentIds: selectedStudents.map(s => s.id)
                });
            }

            navigate('/admin/batches');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to save batch');
        } finally {
            setLoading(false);
        }
    };

    if (dataLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="animate-spin text-[#8b5cf6]" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/batches')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <ArrowLeft size={22} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{isEdit ? 'Edit Batch' : 'Create New Batch'}</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        {isEdit ? 'Update batch details and add more students' : 'Set up a new learning batch with course, teacher and students'}
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
                    <h2 className="text-base font-semibold text-gray-700 flex items-center gap-2">
                        <BookOpen size={18} className="text-purple-500" /> Batch Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Batch Name *</label>
                            <input type="text" required value={form.batchName}
                                onChange={e => setForm(p => ({ ...p, batchName: e.target.value }))}
                                placeholder="e.g. React Batch - April 2025"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/30 focus:border-[#8b5cf6] text-sm" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Course *</label>
                            <select required value={form.courseId}
                                onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/30 focus:border-[#8b5cf6] text-sm bg-white">
                                <option value="">Select Course</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Teacher *</label>
                            <select required value={form.teacherId}
                                onChange={e => setForm(p => ({ ...p, teacherId: e.target.value }))}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/30 focus:border-[#8b5cf6] text-sm bg-white">
                                <option value="">Select Teacher</option>
                                {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.email})</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                            <input type="date" value={form.startDate}
                                onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/30 focus:border-[#8b5cf6] text-sm" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</label>
                            <input type="date" value={form.endDate}
                                onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/30 focus:border-[#8b5cf6] text-sm" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                            <select value={form.batchStatus}
                                onChange={e => setForm(p => ({ ...p, batchStatus: e.target.value }))}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/30 focus:border-[#8b5cf6] text-sm bg-white">
                                <option value="upcoming">Upcoming</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                            <textarea rows={3} value={form.description}
                                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                placeholder="Optional batch description..."
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/30 focus:border-[#8b5cf6] text-sm resize-none" />
                        </div>
                    </div>
                </div>

                {/* Students Selector Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-gray-700 flex items-center gap-2">
                            <Users size={18} className="text-blue-500" />
                            {isEdit ? 'Add More Students' : 'Add Students'}
                        </h2>
                        {selectedStudents.length > 0 && (
                            <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">
                                {selectedStudents.length} selected
                            </span>
                        )}
                    </div>

                    {selectedStudents.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedStudents.map(s => (
                                <span key={s.id} className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-xs font-medium">
                                    {s.name}
                                    <button type="button" onClick={() => toggleStudent(s)} className="hover:text-red-500">
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    <input type="text" placeholder="Search students by name or email..."
                        value={studentSearch} onChange={e => setStudentSearch(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/30 focus:border-[#8b5cf6] text-sm" />

                    <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
                        {filteredStudents.length === 0 ? (
                            <p className="text-center text-sm text-gray-400 py-4">
                                {studentSearch ? 'No results found' : 'All students are already in this batch'}
                            </p>
                        ) : filteredStudents.map(s => {
                            const isSelected = selectedStudents.find(sel => sel.id === s.id);
                            return (
                                <div key={s.id} onClick={() => toggleStudent(s)}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-colors ${isSelected ? 'bg-purple-50 border border-purple-200' : 'hover:bg-gray-50'}`}>
                                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                        {s.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{s.email}</p>
                                    </div>
                                    {isSelected ? (
                                        <UserCheck size={18} className="text-purple-500 flex-shrink-0" />
                                    ) : (
                                        <Plus size={18} className="text-gray-300 flex-shrink-0" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pb-4">
                    <button type="button" onClick={() => navigate('/admin/batches')}
                        className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading}
                        className="flex items-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-60 text-white px-8 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm">
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {isEdit ? 'Update Batch' : 'Create Batch'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BatchCreate;
