import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle } from 'lucide-react';

const BookingModal = ({ mentor, onClose }) => {
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isBooked, setIsBooked] = useState(false);

    const slots = [
        "10:00 AM", "11:30 AM", "2:00 PM", "4:30 PM"
    ];

    const handleBook = () => {
        if (!selectedSlot) return;
        setIsBooked(true);
        setTimeout(() => {
            onClose();
        }, 1500);
    };

    if (!mentor) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

            <div className={`relative bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl transform transition-all ${isBooked ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
                {isBooked ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
                        <p className="text-gray-500">Meeting scheduled with {mentor.name}.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Book Session</h3>
                                <p className="text-sm text-gray-500">with {mentor.name}</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Calendar size={16} /> Select Date
                            </h4>
                            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                                {[0, 1, 2, 3, 4].map(i => {
                                    const date = new Date();
                                    date.setDate(date.getDate() + i);
                                    return (
                                        <button
                                            key={i}
                                            className={`flex flex-col items-center min-w-[60px] p-2 rounded-xl border ${i === 0 ? 'border-[#8b5cf6] bg-purple-50 text-[#8b5cf6]' : 'border-gray-200 text-gray-500'}`}
                                        >
                                            <span className="text-xs font-bold uppercase">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                            <span className="text-lg font-bold">{date.getDate()}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mb-8">
                            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Clock size={16} /> Available Slots
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                {slots.map(slot => (
                                    <button
                                        key={slot}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`py-2 rounded-lg text-sm font-bold transition-all border ${selectedSlot === slot
                                                ? 'bg-[#8b5cf6] text-white border-[#8b5cf6]'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-purple-200 hover:bg-purple-50'
                                            }`}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleBook}
                            disabled={!selectedSlot}
                            className="w-full py-4 rounded-xl bg-[#8b5cf6] text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#7c3aed] transition-all shadow-lg shadow-purple-500/20"
                        >
                            Confirm Booking
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default BookingModal;
