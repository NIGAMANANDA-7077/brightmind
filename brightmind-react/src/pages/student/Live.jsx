import React, { useState } from 'react';
import LiveClassCard from '../../components/student/LiveClassCard';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Video, Loader2 } from 'lucide-react';
import { useBatch } from '../../context/BatchContext';

const Live = () => {
    const { myLiveClasses, myBatch, myBatches, loading } = useBatch();
    const [activeTab, setActiveTab] = useState('Upcoming');
    const [weekOffset, setWeekOffset] = useState(0); // 0 = current week

    // Classes derived from batch
    const liveNow    = myLiveClasses.filter(c => c.status === 'Live');
    const upcoming   = myLiveClasses.filter(c => c.status === 'Upcoming' || c.status === 'Live');
    const recorded   = myLiveClasses.filter(c => c.status === 'Completed');
    const displayed  = activeTab === 'Upcoming' ? upcoming : recorded;

    // Build week days for calendar
    const today = new Date();
    const getWeekDays = () => {
        const days = [];
        // Find Monday of the current week + weekOffset
        const monday = new Date(today);
        const dayOfWeek = today.getDay(); // 0=Sun
        const diffToMon = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
        monday.setDate(today.getDate() + diffToMon + weekOffset * 7);
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            days.push(d);
        }
        return days;
    };
    const weekDays = getWeekDays();
    const weekLabel = weekDays[0].toLocaleString('default', { month: 'long', year: 'numeric' });

    // Dot only for upcoming/live classes on that date
    const upcomingDateSet = new Set(
        myLiveClasses
            .filter(c => c.status === 'Upcoming' || c.status === 'Live')
            .map(c => c.classDate)
    );

    const todayStr = today.toISOString().split('T')[0];

    if (loading) {
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
                    <p className="text-gray-500 mt-1">
                        {myBatches && myBatches.length > 0 ? (
                            <span>
                                Batch: {myBatches.map((b, i) => (
                                    <span key={b.id}>
                                        <span className="font-semibold text-[#8b5cf6]">{b.batchName}</span>
                                        {b.course?.title ? ` · ${b.course.title}` : ''}
                                        {i < myBatches.length - 1 ? '  |  ' : ''}
                                    </span>
                                ))}
                            </span>
                        ) : 'Join sessions or watch recordings'}
                    </p>
                </div>
                {liveNow.length > 0 && (
                    <div className="flex items-center gap-3 bg-red-50 px-4 py-2 rounded-xl border border-red-100 animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-red-600 font-bold text-sm">{liveNow.length} Class Live Now</span>
                    </div>
                )}
            </div>

            {/* Live Now Section */}
            {activeTab === 'Upcoming' && liveNow.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Video size={20} className="text-red-500" /> Live Now
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        {liveNow.map(session => (
                            <LiveClassCard key={session.id} session={session} />
                        ))}
                    </div>
                </div>
            )}

            {/* Weekly Calendar */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                        <CalendarIcon size={20} className="text-[#8b5cf6]" />
                        {weekLabel}
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={() => setWeekOffset(w => w - 1)} className="p-1 hover:bg-gray-100 rounded-lg"><ChevronLeft size={20} /></button>
                        <button onClick={() => setWeekOffset(w => w + 1)} className="p-1 hover:bg-gray-100 rounded-lg"><ChevronRight size={20} /></button>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="text-xs font-bold text-gray-400 mb-2">{day}</div>
                    ))}
                    {weekDays.map((day) => {
                        const dateStr = day.toISOString().split('T')[0];
                        const isToday = dateStr === todayStr;
                        const hasUpcoming = upcomingDateSet.has(dateStr);

                        return (
                            <div
                                key={dateStr}
                                className={`h-12 rounded-xl flex flex-col items-center justify-center transition-all ${
                                    isToday
                                        ? 'bg-[#8b5cf6] text-white shadow-lg shadow-purple-500/30'
                                        : 'text-gray-700'
                                }`}
                            >
                                <span className="text-sm font-bold">{day.getDate()}</span>
                                {hasUpcoming && (
                                    <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isToday ? 'bg-white' : 'bg-[#8b5cf6]'}`}></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Tabs */}
            <div>
                <div className="flex border-b border-gray-200 mb-6">
                    {['Upcoming', 'Recorded'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${
                                activeTab === tab
                                    ? 'border-[#8b5cf6] text-[#8b5cf6]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab} ({tab === 'Upcoming' ? upcoming.length : recorded.length})
                        </button>
                    ))}
                </div>

                <div className="space-y-4">
                    {displayed.length > 0 ? (
                        displayed.map(session => (
                            <LiveClassCard key={session.id} session={session} />
                        ))
                    ) : (
                        <div className="text-center py-12 text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                            <CalendarIcon size={40} className="mx-auto mb-3 opacity-20" />
                            <p className="font-medium">
                                {activeTab === 'Upcoming' ? 'No upcoming sessions' : 'No recorded sessions yet'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Live;
