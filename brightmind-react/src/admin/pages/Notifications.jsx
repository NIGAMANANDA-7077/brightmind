import React, { useState } from 'react';
import { Bell, CheckSquare, ArrowLeft, Search, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';

const TYPE_ICON = {
    announcement: '📢',
    assignment: '📝',
    exam: '📋',
    discussion: '💬',
    submission: '📩',
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
};

const AdminNotifications = () => {
    const { notifications, markAsRead, markAllAsRead } = useNotifications();
    const [selectedNotif, setSelectedNotif] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('All');
    const navigate = useNavigate();

    const handleClick = (notif) => {
        if (!notif.read) markAsRead(notif.id);
        if (notif.link) {
            navigate(notif.link);
            return;
        }
        setSelectedNotif(notif);
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
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-gray-500 dark:text-gray-400">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Bell size={22} className="text-[#8b5cf6]" />
                            Notifications
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'} · {notifications.length} total
                        </p>
                    </div>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 px-4 py-2 bg-[#8b5cf6]/10 text-[#8b5cf6] rounded-xl font-bold text-sm hover:bg-[#8b5cf6]/20 transition-colors"
                    >
                        <CheckSquare size={16} />
                        Mark All Read
                    </button>
                )}
            </div>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search notifications..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20"
                    />
                </div>
                <div className="flex gap-2">
                    {['All', 'Unread', 'Read'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === f ? 'bg-[#8b5cf6] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notification List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {filtered.length > 0 ? (
                    <div className="divide-y divide-gray-50 dark:divide-gray-700">
                        {filtered.map(notif => (
                            <div
                                key={notif.id}
                                onClick={() => handleClick(notif)}
                                className={`flex items-start gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!notif.read ? 'bg-purple-50/40 dark:bg-purple-900/10' : ''}`}
                            >
                                <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center text-lg flex-shrink-0 mt-0.5">
                                    {TYPE_ICON[notif.type] || '🔔'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={`text-sm font-bold ${!notif.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'} line-clamp-1`}>
                                            {notif.title}
                                        </p>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-[10px] text-gray-400 whitespace-nowrap">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                            {!notif.read && <span className="w-2 h-2 bg-[#8b5cf6] rounded-full"></span>}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{notif.message}</p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                            <Calendar size={10} />
                                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${!notif.read ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                                            {!notif.read ? 'Unread' : 'Read'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell size={28} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No notifications found</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                            {filter !== 'All' ? `No ${filter.toLowerCase()} notifications` : searchQuery ? 'Try a different search' : 'You\'re all caught up!'}
                        </p>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedNotif && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedNotif(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <span>{TYPE_ICON[selectedNotif.type] || '🔔'}</span> Notification
                            </h3>
                            <button onClick={() => setSelectedNotif(null)} className="text-gray-400 text-xl">&times;</button>
                        </div>
                        <div className="p-7">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{selectedNotif.title}</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">{selectedNotif.message}</p>
                            <p className="text-xs text-gray-400 mt-5 flex items-center gap-1">
                                <Calendar size={12} />
                                {new Date(selectedNotif.createdAt).toLocaleString()}
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/30 text-right">
                            <button onClick={() => setSelectedNotif(null)} className="px-5 py-2 bg-[#8b5cf6] text-white rounded-xl font-bold text-sm hover:bg-[#7c3aed]">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminNotifications;
