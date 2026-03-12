import React, { useState, useEffect, useCallback } from 'react';
import { Video, Calendar as CalendarIcon, Plus, Clock, Link as LinkIcon, Loader2, PlayCircle, Trash2, Edit2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import { useUser } from '../../context/UserContext';
import { useBatch } from '../../context/BatchContext';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const statusColor = {
    Live: 'bg-red-100 text-red-600',
    Upcoming: 'bg-blue-100 text-blue-600',
    Completed: 'bg-green-100 text-green-600',
};

const Live = () => {
    const { user } = useUser();
    const [searchParams, setSearchParams] = useSearchParams();
    const [tab, setTab] = useState('Upcoming');
    const [selectedDate, setSelectedDate] = useState(new Date().getDate());
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const { myBatches } = useBatch();
    const [filterBatchId, setFilterBatchId] = useState('All');
    const [form, setForm] = useState({
        title: '',
        description: '',
        courseId: '',
        batchId: '',
        date: '',
        time: '',
        duration: '60',
        meetingLink: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [fetchError, setFetchError] = useState('');
    const [actionBanner, setActionBanner] = useState('');
    const [showRecordingModal, setShowRecordingModal] = useState(false);
    const [recordingForm, setRecordingForm] = useState({ id: '', url: '' });

    // ─── Data Fetching ─────────────────────────────────────────

    const fetchTeacherCourses = useCallback(async () => {
        if (!user?.id) return;

        try {
            const res = await api.get(`/courses/teacher/${user.id}`);
            const teacherCourses = Array.isArray(res.data) ? res.data : [];
            setCourses(teacherCourses);

            if (teacherCourses.length === 0) {
                setSelectedCourseId('');
                setSessions([]);
                return;
            }

            const urlCourseId = (searchParams.get('courseId') || '').trim();
            const hasUrlCourse = teacherCourses.some(course => course.id === urlCourseId);
            const nextCourseId = hasUrlCourse
                ? urlCourseId
                : (selectedCourseId && teacherCourses.some(course => course.id === selectedCourseId)
                    ? selectedCourseId
                    : teacherCourses[0].id);

            setSelectedCourseId(nextCourseId);
            setForm(prev => ({ ...prev, courseId: nextCourseId }));
            setSearchParams({ courseId: nextCourseId }, { replace: true });
        } catch (err) {
            console.error("Failed to fetch courses:", err);
            setFetchError(err.response?.data?.message || 'Failed to load your courses.');
        }
    }, [user?.id, searchParams, selectedCourseId, setSearchParams]);

    const fetchLiveClasses = useCallback(async (courseIdToFetch) => {
        const activeCourseId = (courseIdToFetch || selectedCourseId || '').trim();

        if (!activeCourseId) {
            setSessions([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setFetchError('');
        try {
            const res = await api.get(`/live-classes/${activeCourseId}`);
            setSessions(res.data.liveClasses || []);
        } catch (err) {
            console.error("Failed to fetch live sessions:", err);
            setSessions([]);
            setFetchError(err.response?.data?.message || 'Failed to load live classes.');
        } finally {
            setLoading(false);
        }
    }, [selectedCourseId]);

    useEffect(() => {
        fetchTeacherCourses();
    }, [fetchTeacherCourses]);

    useEffect(() => {
        if (!selectedCourseId) return;
        setSearchParams({ courseId: selectedCourseId }, { replace: true });
        setForm(prev => ({ ...prev, courseId: selectedCourseId }));
        fetchLiveClasses(selectedCourseId);
    }, [selectedCourseId, fetchLiveClasses, setSearchParams]);

    // ─── Handlers ──────────────────────────────────────────────

    const handleSchedule = async () => {
        setErrorMsg('');
        setActionBanner('');
        if (!form.title || !form.courseId || !form.date || !form.time || !form.meetingLink) {
            setErrorMsg('Please fill in all required fields.');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...form,
                classDate: form.date,
                startTime: form.time,
                duration: `${form.duration} minutes`
            };

            if (isEditing) {
                await api.put(`/live-classes/${editingId}`, payload);
                setActionBanner('Session updated successfully.');
            } else {
                await api.post('/live-classes', payload);
                setActionBanner('Session scheduled successfully.');
            }

            // Always re-fetch from DB to ensure persistence
            await fetchLiveClasses(form.courseId);

            setForm({
                title: '',
                description: '',
                courseId: selectedCourseId,
                batchId: '',
                date: '',
                time: '',
                duration: '60',
                meetingLink: ''
            });
            setIsEditing(false);
            setEditingId(null);
            setShowScheduleForm(false);
        } catch (err) {
            console.error("Failed to schedule:", err);
            setErrorMsg(err.response?.data?.message || 'Action failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (session) => {
        setForm({
            title: session.title,
            description: session.description,
            courseId: session.courseId,
            batchId: session.batchId || '',
            date: session.classDate,
            time: session.startTime,
            duration: String(session.duration || '60').replace(' minutes', ''),
            meetingLink: session.meetingLink
        });
        setEditingId(session.id);
        setIsEditing(true);
        setShowScheduleForm(true);
    };

    const handleDelete = async (id) => {
        setActionBanner('');
        if (!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`/live-classes/${id}`);
            setActionBanner('Session deleted successfully.');
            await fetchLiveClasses(selectedCourseId);
        } catch (err) {
            console.error("Delete failed:", err);
            setFetchError(err.response?.data?.message || 'Failed to delete session.');
        }
    };

    const handleUpdateRecording = async () => {
        if (!recordingForm.url) return;
        setActionBanner('');
        setIsSubmitting(true);
        try {
            await api.patch(`/live-classes/${recordingForm.id}/recording`, { recordingUrl: recordingForm.url });
            setActionBanner('Recording link saved.');
            setShowRecordingModal(false);
            await fetchLiveClasses(selectedCourseId);
        } catch (err) {
            console.error("Recording update failed:", err);
            setErrorMsg(err.response?.data?.message || 'Failed to update recording.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ─── Filtering ─────────────────────────────────────────────

    // Filter by tab AND by batch
    const baseFiltered = sessions.filter(s => filterBatchId === 'All' || s.batchId === filterBatchId);
    
    const liveNow = baseFiltered.filter(s => s.status === 'Live');
    const filtered = tab === 'Upcoming'
        ? baseFiltered.filter(s => s.status === 'Upcoming' || s.status === 'Live')
        : baseFiltered.filter(s => s.status === 'Completed');

    if (loading && courses.length === 0) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#8b5cf6]" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Live Classes</h1>
                    <p className="text-gray-500 mt-1">Schedule and manage your live teaching sessions</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        disabled={courses.length === 0}
                        className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#8b5cf6]/30"
                    >
                        {courses.length === 0 && (
                            <option value="">No courses found</option>
                        )}
                        {courses.map(c => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                    </select>
                    <select
                        value={filterBatchId}
                        onChange={(e) => setFilterBatchId(e.target.value)}
                        disabled={courses.length === 0}
                        className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#8b5cf6]/30"
                    >
                        <option value="All">All Batches</option>
                        {myBatches.filter(b => b.courseId === selectedCourseId || b.course?.id === selectedCourseId).map(b => (
                            <option key={b.id} value={b.id}>{b.batchName}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => {
                            setForm(p => ({ ...p, courseId: selectedCourseId }));
                            setIsEditing(false);
                            setShowScheduleForm(true);
                        }}
                        disabled={!selectedCourseId}
                        className="flex items-center gap-2 bg-[#8b5cf6] text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#7c3aed] transition-colors"
                    >
                        <Plus size={18} /> Schedule
                    </button>
                </div>
            </div>

            {actionBanner && (
                <div className="bg-green-50 border border-green-100 text-green-700 text-sm font-medium rounded-xl px-4 py-3">
                    {actionBanner}
                </div>
            )}

            {/* Live Now Banner */}
            {liveNow.length > 0 && liveNow.map(s => (
                <div key={s.id} className="bg-gradient-to-r from-red-500 to-red-600 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Video size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                <span className="font-bold text-white/90 uppercase text-xs tracking-wider">Live Now</span>
                            </div>
                            <h3 className="font-bold text-lg">{s.title}</h3>
                            <p className="text-white/80 text-sm">{s.startTime} · {s.duration}</p>
                        </div>
                    </div>
                    <a href={s.meetingLink} target="_blank" rel="noopener noreferrer" className="bg-white text-red-600 font-bold px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors flex items-center gap-2 flex-shrink-0">
                        <LinkIcon size={16} /> Join Session
                    </a>
                </div>
            ))}

            {/* Weekly Calendar Widget */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                        <CalendarIcon size={20} className="text-[#8b5cf6]" />
                        {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h2>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center">
                    {weekDays.map(d => (
                        <div key={d} className="text-xs font-bold text-gray-400 mb-2">{d}</div>
                    ))}
                    {Array.from({ length: 7 }).map((_, i) => {
                        const day = new Date();
                        day.setDate(day.getDate() - day.getDay() + i + 1);
                        const d = day.getDate();
                        const dateStr = day.toISOString().split('T')[0];
                        const hasClass = sessions.some(s => s.classDate === dateStr);
                        return (
                            <button
                                key={d}
                                onClick={() => setSelectedDate(d)}
                                className={`h-12 rounded-xl flex flex-col items-center justify-center transition-all ${selectedDate === d
                                    ? 'bg-[#8b5cf6] text-white shadow-lg shadow-purple-500/30'
                                    : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                <span className="text-sm font-bold">{d}</span>
                                {hasClass && (
                                    <div className={`w-1 h-1 rounded-full mt-1 ${selectedDate === d ? 'bg-white' : 'bg-[#8b5cf6]'}`} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Sessions List */}
            <div>
                <div className="flex border-b border-gray-200 mb-6">
                    {['Upcoming', 'Completed'].map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${tab === t
                                ? 'border-[#8b5cf6] text-[#8b5cf6]'
                                : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            {t} ({tab === 'Upcoming'
                                ? sessions.filter(s => s.status === 'Upcoming' || s.status === 'Live').length
                                : sessions.filter(s => s.status === 'Completed').length})
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="h-40 flex items-center justify-center">
                        <Loader2 className="animate-spin text-[#8b5cf6]" size={30} />
                    </div>
                ) : fetchError ? (
                    <div className="text-center py-10 text-red-500 bg-red-50 rounded-2xl border border-red-100">
                        <p className="font-medium">{fetchError}</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-14 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <CalendarIcon size={36} className="mx-auto mb-3 opacity-20" />
                        <p className="font-medium">No {tab.toLowerCase()} sessions found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map(session => (
                            <div key={session.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-all">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${session.status === 'Live' ? 'bg-red-100' : session.status === 'Upcoming' ? 'bg-blue-100' : 'bg-green-50'}`}>
                                    <Video size={22} className={session.status === 'Live' ? 'text-red-500' : session.status === 'Upcoming' ? 'text-blue-500' : 'text-green-500'} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h3 className="font-bold text-gray-900 truncate">{session.title}</h3>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor[session.status] || 'bg-gray-100 text-gray-600'}`}>{session.status}</span>
                                        {session.batchId && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100 uppercase tracking-widest">
                                                {myBatches.find(b => b.id === session.batchId)?.batchName || 'Batch'}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mb-2 truncate">{session.description}</p>
                                    <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                                        <span className="flex items-center gap-1"><CalendarIcon size={12} />{session.classDate}</span>
                                        <span className="flex items-center gap-1"><Clock size={12} />{session.startTime} · {session.duration}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {session.status === 'Completed' ? (
                                        <button
                                            onClick={() => {
                                                setRecordingForm({ id: session.id, url: session.recordingUrl || '' });
                                                setShowRecordingModal(true);
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 font-bold text-xs transition-colors"
                                        >
                                            <PlayCircle size={14} /> {session.recordingUrl ? 'Edit Recording' : 'Add Recording'}
                                        </button>
                                    ) : (
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleEdit(session)}
                                                className="p-2 text-gray-400 hover:text-[#8b5cf6] hover:bg-[#8b5cf6]/10 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(session.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                    <a
                                        href={session.status === 'Completed' ? session.recordingUrl : session.meetingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm flex-shrink-0 transition-colors ${!session.meetingLink && session.status !== 'Completed' ? 'pointer-events-none opacity-50' : ''} ${session.status === 'Live'
                                            ? 'bg-red-500 text-white hover:bg-red-600'
                                            : session.status === 'Upcoming'
                                                ? 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed]'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        <LinkIcon size={14} />
                                        {session.status === 'Completed' ? 'Watch' : 'Join'}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Schedule Modal */}
            {showScheduleForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900 text-lg">{isEditing ? 'Edit Live Class' : 'Schedule Live Class'}</h3>
                            <button onClick={() => setShowScheduleForm(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                                <Plus size={20} className="rotate-45" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                            {errorMsg && (
                                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-medium">
                                    {errorMsg}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Session Title</label>
                                <input
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/30"
                                    placeholder="Enter session title"
                                    value={form.title}
                                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/30 h-20 resize-none"
                                    placeholder="Brief overview"
                                    value={form.description}
                                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Specific Batch (Optional)</label>
                                <select
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/30"
                                    value={form.batchId}
                                    onChange={e => setForm(p => ({ ...p, batchId: e.target.value }))}
                                >
                                    <option value="">-- All Batches (Global Course) --</option>
                                    {myBatches.filter(b => b.courseId === selectedCourseId || b.course?.id === selectedCourseId).map(b => (
                                        <option key={b.id} value={b.id}>{b.batchName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input type="date" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/30" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                    <input type="time" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/30" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                                    <input type="number" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/30" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                                    <input
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/30"
                                        placeholder="https://..."
                                        value={form.meetingLink}
                                        onChange={e => setForm(p => ({ ...p, meetingLink: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 p-5 border-t border-gray-100 bg-gray-50/50">
                            <button onClick={() => setShowScheduleForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 bg-white">Cancel</button>
                            <button
                                onClick={handleSchedule}
                                disabled={isSubmitting}
                                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors ${isSubmitting ? 'bg-gray-400' : 'bg-[#8b5cf6] hover:bg-[#7c3aed]'}`}
                            >
                                {isSubmitting && <Loader2 className="animate-spin" size={16} />}
                                {isEditing ? 'Update' : 'Schedule'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Recording Modal */}
            {showRecordingModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900">Add Recording</h3>
                            <button onClick={() => setShowRecordingModal(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 rotate-45"><Plus size={20} /></button>
                        </div>
                        <div className="p-5">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Recording Link</label>
                            <input
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500/20"
                                placeholder="https://..."
                                value={recordingForm.url}
                                onChange={e => setRecordingForm(p => ({ ...p, url: e.target.value }))}
                            />
                        </div>
                        <div className="p-5 border-t border-gray-100 flex gap-3 bg-gray-50/50">
                            <button onClick={() => setShowRecordingModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 bg-white">Cancel</button>
                            <button
                                onClick={handleUpdateRecording}
                                disabled={isSubmitting || !recordingForm.url}
                                className="flex-1 py-2.5 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 disabled:bg-gray-300 transition-colors"
                            >
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Live;
