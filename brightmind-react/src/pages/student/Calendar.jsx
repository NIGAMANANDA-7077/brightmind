import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { calendarEvents, upcomingEvents } from '../../data/calendarMock';
import CalendarEventModal from '../../components/student/calendar/CalendarEventModal';

const Calendar = () => {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [view, setView] = useState('Month');
    const today = new Date();

    // Simplified Month Grid Generation
    const daysInMonth = 31; // Simplified for mock
    const firstDayOffset = 2; // Starts on Tuesday for visual variety

    const days = Array.from({ length: 35 }, (_, i) => {
        const dayNum = i - firstDayOffset + 1;
        if (dayNum < 1 || dayNum > daysInMonth) return null;
        return dayNum;
    });

    const getEventsForDay = (day) => {
        if (!day) return [];
        return calendarEvents.filter(e => e.date.getDate() === day);
    };

    return (
        <div className="flex flex-col xl:flex-row gap-8 h-full">
            {/* Main Calendar Area */}
            <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <CalendarIcon className="text-[#8b5cf6]" />
                        February 2026
                    </h1>

                    <div className="flex items-center gap-4 bg-gray-50 p-1 rounded-xl">
                        {['Month', 'Week', 'Day'].map(v => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === v ? 'bg-white text-[#8b5cf6] shadow-sm' : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft size={20} /></button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight size={20} /></button>
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1">
                    <div className="grid grid-cols-7 mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-sm font-bold text-gray-400 uppercase tracking-wider">{day}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 grid-rows-5 gap-4 h-full min-h-[500px]">
                        {days.map((day, i) => (
                            <div
                                key={i}
                                className={`border border-gray-100 rounded-2xl p-2 relative transition-all group ${day ? 'hover:border-[#8b5cf6] bg-white' : 'bg-gray-50/50'
                                    } ${day === today.getDate() ? 'ring-2 ring-[#8b5cf6]/20' : ''}`}
                            >
                                {day && (
                                    <>
                                        <span className={`text-sm font-bold block mb-2 ${day === today.getDate()
                                                ? 'w-7 h-7 bg-[#8b5cf6] text-white rounded-full flex items-center justify-center'
                                                : 'text-gray-700'
                                            }`}>
                                            {day}
                                        </span>
                                        <div className="space-y-1">
                                            {getEventsForDay(day).map(event => (
                                                <button
                                                    key={event.id}
                                                    onClick={() => setSelectedEvent(event)}
                                                    className={`w-full text-left px-2 py-1.5 rounded-lg text-[10px] font-bold truncate transition-transform hover:scale-105 ${event.color}`}
                                                >
                                                    {event.title}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="w-full xl:w-80 space-y-6">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Upcoming Events</h2>
                    <div className="space-y-4">
                        {upcomingEvents.map(event => (
                            <div
                                key={event.id}
                                onClick={() => setSelectedEvent(event)}
                                className="flex gap-3 items-start p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-gray-100"
                            >
                                <div className={`w-12 h-12 rounded-xl shrink-0 flex flex-col items-center justify-center ${event.color.split(' ')[0]} ${event.color.split(' ')[1]}`}>
                                    <span className="text-xs font-bold uppercase">{event.date.toLocaleDateString('en-US', { month: 'short' })}</span>
                                    <span className="text-lg font-bold">{event.date.getDate()}</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{event.title}</h4>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                        <Clock size={12} />
                                        <span>{event.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal */}
            <CalendarEventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        </div>
    );
};

export default Calendar;
