import React from 'react';
import { X, Calendar, Clock, AlignLeft } from 'lucide-react';

const CalendarEventModal = ({ event, onClose }) => {
    if (!event) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scale-in">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={20} />
                </button>

                <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-4 ${event.color}`}>
                    {event.type}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4">{event.title}</h3>

                <div className="space-y-4">
                    <div className="flex items-start gap-3 text-gray-600">
                        <Calendar size={18} className="shrink-0 mt-0.5" />
                        <span className="text-sm font-medium">{event.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-start gap-3 text-gray-600">
                        <Clock size={18} className="shrink-0 mt-0.5" />
                        <span className="text-sm font-medium">{event.time}</span>
                    </div>
                    {event.description && (
                        <div className="flex items-start gap-3 text-gray-600">
                            <AlignLeft size={18} className="shrink-0 mt-0.5" />
                            <p className="text-sm leading-relaxed">{event.description}</p>
                        </div>
                    )}
                </div>

                <div className="mt-8">
                    <button onClick={onClose} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CalendarEventModal;
