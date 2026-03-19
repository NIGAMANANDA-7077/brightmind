import React, { useState } from 'react';
import { Bell, CheckSquare, ArrowLeft, Search, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';

// Notification detail modal (inline, no external dependency needed)
const NotifDetailModal = ({ notif, onClose }) => {
    if (!notif) return null;
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">📢</span>
                        <h3 className="font-bold text-gray-900 dark:text-white">Notification</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none">&times;</button>
                </div>
                <div className="p-7">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{notif.title}</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-5 flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(notif.createdAt).toLocaleString()}
                    </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 text-right">
                    <button onClick={onClose} className="px-5 py-2 bg-[#8b5cf6] text-white rounded-xl font-bold text-sm hover:bg-[#7c3aed]">Close</button>
                </div>
            </div>
        </div>
    );
};

const TeacherNotifications = () => {
    const { notifications, markAsRead, markAllAsRead } = useNotifications();
    const [showModal, setShowModal] = useState(false);
    const [selectedNotif, setSelectedNotif] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('All');
    const navigate = useNavigate();

    const handleClick = (notif) => {
        if (!notif.read) markAsRead(notif.id);
        // If notification has a link, navigate there
        if (notif.link) {
            navigate(notif.link);
            return;
        }
        setSelectedNotif(notif);
        setShowModal(true);
    };

    const filtered = notifications.filter(n => {
        const match = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.message.toLowerCase().includes(searchQuery.toLowerCase());
        if (filter === 'Unread') return match && !n.read;
        if (filter === 'Read') return match && n.read;
        return match;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2.5 bg-gray-50 dark:bg-gray-700 text-gray-500 rounded-xl hover:bg-[#8b5cf6] hover:text-white transition-all">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            Notifications
                            {unreadCount > 0 && (
                                <span className="bg-red-100 text-red-600 text-sm px-3 py-0.5 rounded-full font-bold">{unreadCount} Unread</span>
                            )}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">All your alerts and announcements</p>
                    </div>
                </div>
                {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="flex items-center gap-2 px-5 py-2.5 bg-[#8b5cf6]/10 text-[#8b5cf6] font-bold rounded-xl hover:bg-[#8b5cf6] hover:text-white transition-all text-sm">
                        <CheckSquare size={16} /> Mark all as read
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search notifications..."
                        className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 text-sm"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-100 dark:border-gray-700">
                    {['All', 'Unread', 'Read'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === f ? 'bg-[#8b5cf6] text-white' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {filtered.length > 0 ? (
                    <div className="divide-y divide-gray-50 dark:divide-gray-700">
                        {filtered.map(notif => (
                            <div
                                key={notif.id}
                                onClick={() => handleClick(notif)}
                                className={`p-5 flex items-start gap-4 cursor-pointer hover:bg-gray-50/70 dark:hover:bg-gray-700/40 transition-all group ${!notif.read ? 'bg-purple-50/30 dark:bg-purple-900/5' : ''}`}
                            >
                                <div className={`p-3 rounded-xl shrink-0 ${!notif.read ? 'bg-purple-100 text-[#8b5cf6]' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                                    <Bell size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-3 mb-1">
                                        <h3 className={`font-bold text-sm truncate group-hover:text-[#8b5cf6] transition-colors ${!notif.read ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {notif.title}
                                        </h3>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                <Calendar size={11} />
                                                {new Date(notif.createdAt).toLocaleDateString()}
                                            </span>
                                            {!notif.read && <span className="w-2.5 h-2.5 bg-[#8b5cf6] rounded-full"></span>}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{notif.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell size={32} className="text-gray-300" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">No notifications found</h3>
                        <p className="text-sm text-gray-500">
                            {searchQuery ? `No results for "${searchQuery}"` : "You're all caught up!"}
                        </p>
                    </div>
                )}
            </div>

            <NotifDetailModal notif={selectedNotif} onClose={() => setSelectedNotif(null)} />
        </div>
    );
};

export default TeacherNotifications;
