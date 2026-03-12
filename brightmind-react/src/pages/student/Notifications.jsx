import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, Calendar, CheckSquare, ArrowLeft, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSharedAnnouncements } from '../../context/SharedAnnouncementsContext';
import AnnouncementDetailModal from '../../components/student/modals/AnnouncementDetailModal';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAnnModal, setShowAnnModal] = useState(false);
    const [selectedAnn, setSelectedAnn] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('All'); // All, Unread, Read
    const { announcements } = useSharedAnnouncements();
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/notifications?role=Student`);
            setNotifications(res.data);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const handleNotificationClick = (notif) => {
        if (!notif.read) {
            markAsRead(notif.id);
        }

        let displayData = notif;
        if (notif.referenceId) {
            const foundAnn = announcements.find(a => a.id === notif.referenceId);
            if (foundAnn) {
                displayData = foundAnn;
            }
        }

        setSelectedAnn(displayData);
        setShowAnnModal(true);
    };

    const filteredNotifications = notifications.filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.message.toLowerCase().includes(searchQuery.toLowerCase());

        if (filter === 'Unread') return matchesSearch && !n.read;
        if (filter === 'Read') return matchesSearch && n.read;
        return matchesSearch;
    });

    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        if (unreadIds.length === 0) return;

        try {
            await Promise.all(unreadIds.map(id =>
                axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/notifications/${id}/read`)
            ));
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-gray-50 dark:bg-gray-700 text-gray-500 rounded-2xl hover:bg-[#8b5cf6] hover:text-white transition-all shadow-sm group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            Notifications
                            <span className="bg-[#8b5cf6]/10 text-[#8b5cf6] text-sm px-3 py-1 rounded-full font-bold">
                                {notifications.filter(n => !n.read).length} Unread
                            </span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Stay updated with your latest alerts and announcements</p>
                    </div>
                </div>
                <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-2 px-6 py-3 bg-[#8b5cf6]/5 text-[#8b5cf6] font-bold rounded-2xl hover:bg-[#8b5cf6] hover:text-white transition-all order-first md:order-last"
                >
                    <CheckSquare size={18} />
                    Mark all as read
                </button>
            </div>

            {/* Filters & Search */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8b5cf6] transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search notifications..."
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all text-gray-700 dark:text-gray-200"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex bg-white dark:bg-gray-800 p-1 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    {['All', 'Unread', 'Read'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${filter === f ? 'bg-[#8b5cf6] text-white shadow-lg shadow-purple-500/20' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="p-20 text-center animate-pulse">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock size={32} className="text-[#8b5cf6] animate-spin" />
                        </div>
                        <p className="text-gray-500 font-medium">Fetching your updates...</p>
                    </div>
                ) : filteredNotifications.length > 0 ? (
                    <div className="divide-y divide-gray-50 dark:divide-gray-700">
                        {filteredNotifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif)}
                                className={`p-8 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-all flex items-start gap-6 cursor-pointer group relative ${!notif.read ? 'bg-purple-50/30 dark:bg-purple-900/5' : ''}`}
                            >
                                <div className={`p-4 rounded-2xl shrink-0 transition-transform group-hover:scale-110 ${!notif.read ? 'bg-purple-100 text-[#8b5cf6]' : 'bg-gray-100 text-gray-400'}`}>
                                    <Bell size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-4 mb-2">
                                        <h3 className={`text-lg font-bold truncate group-hover:text-[#8b5cf6] transition-colors ${!notif.read ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                                            {notif.title}
                                        </h3>
                                        <div className="flex items-center gap-4 shrink-0">
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                                                <Calendar size={14} />
                                                {new Date(notif.createdAt).toLocaleDateString()}
                                            </span>
                                            {!notif.read && <span className="w-3 h-3 bg-[#8b5cf6] rounded-full ring-4 ring-purple-100 dark:ring-purple-900/20"></span>}
                                        </div>
                                    </div>
                                    <p className={`text-sm leading-relaxed line-clamp-2 ${!notif.read ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}`}>
                                        {notif.message}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bell size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No notifications found</h3>
                        <p className="text-gray-500 max-w-xs mx-auto">
                            {searchQuery ? `We couldn't find any results for "${searchQuery}"` : "You're all caught up! No recent updates for you."}
                        </p>
                    </div>
                )}
            </div>

            <AnnouncementDetailModal
                isOpen={showAnnModal}
                onClose={() => setShowAnnModal(false)}
                announcement={selectedAnn}
            />
        </div>
    );
};

export default Notifications;
