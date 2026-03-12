import React from 'react';
import { X, Bell, Calendar, User } from 'lucide-react';

const AnnouncementDetailModal = ({ isOpen, onClose, announcement }) => {
    if (!isOpen || !announcement) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-slide-up border border-white/20">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] p-8 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors outline-none"
                    >
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-white/20 rounded-2xl">
                            <Bell size={24} />
                        </div>
                        <span className="font-bold text-sm uppercase tracking-widest text-purple-100">Official Announcement</span>
                    </div>
                    <h2 className="text-3xl font-bold leading-tight">{announcement.title}</h2>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <Calendar size={18} className="text-[#8b5cf6]" />
                            <span className="text-sm font-medium">
                                {new Date(announcement.createdAt || announcement.date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <User size={18} className="text-[#8b5cf6]" />
                            <span className="text-sm font-medium">Posted by {announcement.postedBy || 'Bright MIND Admin'}</span>
                        </div>
                    </div>

                    <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-wrap max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {announcement.message}
                    </div>

                    <div className="pt-6 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-8 py-3 bg-[#8b5cf6] text-white font-bold rounded-2xl hover:bg-[#7c3aed] transition-all shadow-lg shadow-purple-500/20 active:scale-95"
                        >
                            Got it, Thanks!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementDetailModal;
