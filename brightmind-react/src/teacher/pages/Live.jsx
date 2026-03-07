import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Video, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, Users, Link as LinkIcon, Loader2 } from 'lucide-react';

// =========================================================
// Teacher Live Classes Page
// Teachers schedule and manage live sessions
// =========================================================

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const statusColor = {
    Live: 'bg-red-100 text-red-600',
    Upcoming: 'bg-blue-100 text-blue-600',
    Completed: 'bg-green-100 text-green-600',
};

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/live-classes`;

const Live = () => {
    const [tab, setTab] = useState('Upcoming');
    const [selectedDate, setSelectedDate] = useState(new Date().getDate());
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ title: '', course: '', date: '', time: '', duration: '60', platform: 'Google Meet', link: '' });

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API_BASE_URL);
            setSessions(res.data);
        } catch (err) {
            console.error("Failed to fetch live sessions:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const liveNow = sessions.filter(s => s.isLive || s.status === 'Live');
    const filtered = tab === 'Upcoming'
        ? sessions.filter(s => s.status === 'Upcoming' || s.status === 'Live')
        : sessions.filter(s => s.status === 'Completed');

    const handleSchedule = async () => {
        if (!form.title || !form.course || !form.date || !form.time) return;

        try {
            const today = new Date().toISOString().split('T')[0];
            const payload = {
                ...form,
                status: form.date > today ? 'Upcoming' : (form.date === today ? 'Upcoming' : 'Completed'),
                studentsJoined: 0,
                isLive: false,
            };

            const res = await axios.post(API_BASE_URL, payload);
            setSessions(prev => [res.data, ...prev]);
            setForm({ title: '', course: '', date: '', time: '', duration: '60', platform: 'Google Meet', link: '' });
            setShowScheduleForm(false);
        } catch (err) {
            console.error("Failed to schedule class:", err);
        }
    };

    if (loading && sessions.length === 0) {
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
                    {liveNow.length > 0 && (
                        <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-xl border border-red-100 animate-pulse">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-red-600 font-bold text-sm">{liveNow.length} Live Now</span>
                        </div>
                    )}
                    <button
                        onClick={() => setShowScheduleForm(true)}
                        className="flex items-center gap-2 bg-[#8b5cf6] text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#7c3aed] transition-colors"
                    >
                        <Plus size={18} /> Schedule Class
                    </button>
                </div>
            </div>

            {/* Live Now Banner */}
            {liveNow.map(s => (
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
                            <p className="text-white/80 text-sm">{s.course} · {s.studentsJoined} students joined</p>
                        </div>
                    </div>
                    <a href={s.link} target="_blank" rel="noopener noreferrer" className="bg-white text-red-600 font-bold px-5 py-2.5 rounded-xl hover:bg-white/90 transition-colors flex items-center gap-2 flex-shrink-0">
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
                    <div className="flex gap-2">
                        <button className="p-1 hover:bg-gray-100 rounded-lg"><ChevronLeft size={20} /></button>
                        <button className="p-1 hover:bg-gray-100 rounded-lg"><ChevronRight size={20} /></button>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center">
                    {weekDays.map(d => (
                        <div key={d} className="text-xs font-bold text-gray-400 mb-2">{d}</div>
                    ))}
                    {Array.from({ length: 7 }).map((_, i) => {
                        const day = new Date();
                        day.setDate(day.getDate() - day.getDay() + i + 1); // Adjust for current week
                        const d = day.getDate();
                        const dateStr = day.toISOString().split('T')[0];
                        const hasClass = sessions.some(s => s.date === dateStr);
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

            {/* Tabs & Sessions List */}
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

                {filtered.length === 0 ? (
                    <div className="text-center py-14 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <CalendarIcon size={36} className="mx-auto mb-3 opacity-20" />
                        <p className="font-medium">No {tab.toLowerCase()} sessions</p>
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
                                        <h3 className="font-bold text-gray-900">{session.title}</h3>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor[session.status] || 'bg-gray-100 text-gray-600'}`}>{session.status}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-2">{session.course}</p>
                                    <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                                        <span className="flex items-center gap-1"><CalendarIcon size={12} />{session.date}</span>
                                        <span className="flex items-center gap-1"><Clock size={12} />{session.time} · {session.duration} min</span>
                                        <span className="flex items-center gap-1"><Users size={12} />{session.studentsJoined} students</span>
                                        <span className="bg-gray-100 px-2 py-0.5 rounded-lg">{session.platform}</span>
                                    </div>
                                </div>
                                <a
                                    href={session.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm flex-shrink-0 transition-colors ${session.status === 'Live'
                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                        : session.status === 'Upcoming'
                                            ? 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed]'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    <LinkIcon size={14} />
                                    {session.status === 'Completed' ? 'Recording' : 'Join'}
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Schedule Modal */}
            {showScheduleForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900 text-lg">Schedule Live Class</h3>
                            <button onClick={() => setShowScheduleForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><Plus size={20} className="text-gray-400 rotate-45" /></button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Session Title</label>
                                <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/30" placeholder="e.g. Mechanics Doubt Clearing" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                                <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/30" placeholder="e.g. Physics 101" value={form.course} onChange={e => setForm(p => ({ ...p, course: e.target.value }))} />
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                                    <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/30" value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))}>
                                        <option>Google Meet</option>
                                        <option>Zoom</option>
                                        <option>Microsoft Teams</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                                <input className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/30" placeholder="https://meet.google.com/..." value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))} />
                            </div>
                        </div>
                        <div className="flex gap-3 p-5 border-t border-gray-100">
                            <button onClick={() => setShowScheduleForm(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">Cancel</button>
                            <button onClick={handleSchedule} className="flex-1 py-2.5 rounded-xl bg-[#8b5cf6] text-white text-sm font-bold hover:bg-[#7c3aed] flex items-center justify-center gap-2">
                                <Video size={16} /> Schedule
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Live;
