import React, { useState } from 'react';
import { useAdminScheduler } from '../context/AdminSchedulerContext';
import SchedulerCalendar from '../components/scheduler/SchedulerCalendar';
import ScheduleModal from '../components/scheduler/ScheduleModal';
import { Plus, ListFilter } from 'lucide-react';

const Scheduler = () => {
    const { schedules } = useAdminScheduler();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleSlotClick = (date) => {
        setSelectedDate(date);
        setSelectedEvent(null);
        setIsModalOpen(true);
    };

    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setSelectedDate(null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 max-w-[1600px] h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Exam Scheduler</h1>
                    <p className="text-gray-500">Plan and manage exam schedules</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors">
                        <ListFilter size={18} /> Filter
                    </button>
                    <button
                        onClick={() => { setSelectedEvent(null); setSelectedDate(new Date()); setIsModalOpen(true); }}
                        className="flex items-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-purple-500/20"
                    >
                        <Plus size={20} /> Schedule Exam
                    </button>
                </div>
            </div>

            {/* Calendar Area */}
            <div className="flex-1">
                <SchedulerCalendar
                    schedules={schedules}
                    currentDate={currentDate}
                    onNextMonth={handleNextMonth}
                    onPrevMonth={handlePrevMonth}
                    onSlotClick={handleSlotClick}
                    onEventClick={handleEventClick}
                />
            </div>

            {/* Modal */}
            {isModalOpen && (
                <ScheduleModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    selectedDate={selectedDate}
                    selectedEvent={selectedEvent}
                />
            )}
        </div>
    );
};

export default Scheduler;
