import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';
import LiveClassCard from '../../components/student/LiveClassCard';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Video, Loader2 } from 'lucide-react';
import { useCourse } from '../../context/CourseContext';

const Live = () => {
    const { courses } = useCourse();
    const [activeTab, setActiveTab] = useState('Upcoming');
    const [selectedDate, setSelectedDate] = useState(new Date().getDate());
    const [liveClasses, setLiveClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');

    const fetchSessions = async () => {
        if (!courses || courses.length === 0) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setFetchError('');

            // Fetch live classes for each enrolled course using the unified endpoint.
            const responses = await Promise.all(courses.map(async (course) => {
                try {
                    const res = await api.get(`/live-classes/${course.id}`);
                    const sessions = Array.isArray(res.data?.liveClasses) ? res.data.liveClasses : [];
                    return sessions.map(session => ({
                        ...session,
                        course: session.course?.title || course.title
                    }));
                } catch (err) {
                    console.error(`Failed for course ${course.id}:`, err);
                    return [];
                }
            }));

            const allSessions = responses.flat();

            // Sort by date and time
            allSessions.sort((a, b) => {
                const dateA = new Date(`${a.classDate} ${a.startTime}`);
                const dateB = new Date(`${b.classDate} ${b.startTime}`);
                return dateA - dateB;
            });

            setLiveClasses(allSessions);
        } catch (err) {
            console.error("Failed to fetch student live sessions:", err);
            setLiveClasses([]);
            setFetchError(err.response?.data?.message || 'Failed to load live classes.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, [courses]);

    const liveNowClasses = liveClasses.filter(c => c.status === 'Live');
    const upcomingClasses = liveClasses.filter(c => c.status === 'Upcoming' || c.status === 'Live');
    const recordedClasses = liveClasses.filter(c => c.status === 'Completed');

    const filteredClasses = activeTab === 'Upcoming' ? upcomingClasses : recordedClasses;

    if (loading && liveClasses.length === 0) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#8b5cf6]" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Live Classes</h1>
                    <p className="text-gray-500 mt-1">Join sessions or watch recordings</p>
                </div>
                {liveNowClasses.length > 0 && (
                    <div className="flex items-center gap-3 bg-red-50 px-4 py-2 rounded-xl border border-red-100 animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-red-600 font-bold text-sm">{liveNowClasses.length} Class Live Now</span>
                    </div>
                )}
            </div>

            {/* Live Now Section */}
            {activeTab === 'Upcoming' && liveNowClasses.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Video size={20} className="text-red-500" />
                        Live Now
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        {liveNowClasses.map(session => (
                            <LiveClassCard key={session.id} session={session} />
                        ))}
                    </div>
                </div>
            )}

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
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="text-xs font-bold text-gray-400 mb-2">{day}</div>
                    ))}
                    {Array.from({ length: 7 }).map((_, i) => {
                        const day = new Date();
                        day.setDate(day.getDate() - day.getDay() + i + 1);
                        const date = day.getDate();
                        const dateStr = day.toISOString().split('T')[0];

                        return (
                            <button
                                key={date}
                                onClick={() => setSelectedDate(date)}
                                className={`h-12 rounded-xl flex flex-col items-center justify-center transition-all ${selectedDate === date
                                    ? 'bg-[#8b5cf6] text-white shadow-lg shadow-purple-500/30'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="text-sm font-bold">{date}</span>
                                {liveClasses.some(c => c.classDate === dateStr) && (
                                    <div className={`w-1 h-1 rounded-full mt-1 ${selectedDate === date ? 'bg-white' : 'bg-[#8b5cf6]'}`}></div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tabs & List */}
            <div>
                <div className="flex border-b border-gray-200 mb-6">
                    {['Upcoming', 'Recorded'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === tab
                                ? 'border-[#8b5cf6] text-[#8b5cf6]'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab === 'Recorded' ? 'Recorded' : 'Upcoming'} {tab === 'Upcoming' && `(${upcomingClasses.length})`}
                        </button>
                    ))}
                </div>

                {fetchError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                        {fetchError}
                    </div>
                )}

                <div className="space-y-4">
                    {filteredClasses.length > 0 ? (
                        filteredClasses.map(session => (
                            <LiveClassCard key={session.id} session={session} />
                        ))
                    ) : (
                        <div className="text-center py-12 text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                            <CalendarIcon size={40} className="mx-auto mb-3 opacity-20" />
                            <p className="font-medium">No sessions scheduled</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Live;
