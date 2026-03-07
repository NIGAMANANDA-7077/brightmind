import React from 'react';
import { ChevronLeft, ChevronRight, Clock, MoreVertical } from 'lucide-react';

const SchedulerCalendar = ({ schedules, currentDate, onNextMonth, onPrevMonth, onSlotClick, onEventClick }) => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }

    const getEventsForDay = (date) => {
        if (!date) return [];
        const dateString = date.toISOString().split('T')[0];
        return schedules.filter(s => s.date === dateString);
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex items-center gap-2">
                    <button onClick={onPrevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ChevronLeft size={20} className="text-gray-500" />
                    </button>
                    <button onClick={onNextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ChevronRight size={20} className="text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 auto-rows-fr h-[600px]">
                {days.map((date, index) => {
                    const events = getEventsForDay(date);
                    const isToday = date && new Date().toDateString() === date.toDateString();

                    return (
                        <div
                            key={index}
                            className={`border-b border-r border-gray-100 min-h-[100px] p-2 relative group transition-colors hover:bg-gray-50 ${!date ? 'bg-gray-50/50' : ''}`}
                            onClick={() => date && onSlotClick(date)}
                        >
                            {date && (
                                <>
                                    <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1
                        ${isToday ? 'bg-[#8b5cf6] text-white' : 'text-gray-700'}
                      `}>
                                        {date.getDate()}
                                    </span>

                                    <div className="space-y-1">
                                        {events.map(event => (
                                            <div
                                                key={event.id}
                                                onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                                                className={`px-2 py-1.5 rounded-md text-xs font-medium cursor-pointer border-l-2 truncate transition-transform hover:scale-[1.02]
                               ${event.status === 'Scheduled'
                                                        ? 'bg-purple-50 text-purple-700 border-purple-500 hover:bg-purple-100'
                                                        : 'bg-gray-100 text-gray-600 border-gray-400 hover:bg-gray-200'}
                             `}
                                            >
                                                <div className="flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {event.time}
                                                </div>
                                                <span className="block truncate">{event.title}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add Button on Hover */}
                                    <button className="absolute bottom-2 right-2 p-1.5 rounded-full bg-[#8b5cf6] text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                        <span className="text-xs font-bold">+</span>
                                    </button>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SchedulerCalendar;
