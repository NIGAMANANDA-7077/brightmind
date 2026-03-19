import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Sun, Moon, Menu, X, Check } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';

const Topbar = ({ toggleMobileSidebar }) => {
    const { user } = useUser();
    const { isDarkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [showNotifications, setShowNotifications] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotifClick = (notif) => {
        if (!notif.read) markAsRead(notif.id);
        setShowNotifications(false);
        if (notif.link) navigate(notif.link);
    };

    return (
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-30 transition-colors">
            {/* Left: Mobile Toggle & Search */}
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleMobileSidebar}
                    className="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                    <Menu size={24} />
                </button>

                <div className="hidden md:flex items-center bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 w-64 focus-within:ring-2 focus-within:ring-[#8b5cf6]/20 transition-shadow">
                    <Search size={18} className="text-gray-400 dark:text-gray-300" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent border-none outline-none text-sm ml-3 w-full text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-400"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors relative"
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Notifications */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors relative"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center px-0.5">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden animate-fadeIn">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                                    {unreadCount > 0 && <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">{unreadCount} new</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                    {unreadCount > 0 && (
                                        <button onClick={markAllAsRead} className="text-xs text-[#8b5cf6] hover:text-purple-700 font-semibold">Mark all read</button>
                                    )}
                                    <button onClick={() => setShowNotifications(false)}><X size={16} className="text-gray-400" /></button>
                                </div>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {notifications.filter(n => !n.read).length > 0 ? (
                                    <div className="divide-y divide-gray-50 dark:divide-gray-700">
                                        {notifications.filter(n => !n.read).slice(0, 8).map((notif) => (
                                            <div
                                                key={notif.id}
                                                onClick={() => handleNotifClick(notif)}
                                                className="p-4 hover:bg-purple-50/60 dark:hover:bg-purple-900/10 transition-colors flex gap-3 cursor-pointer bg-purple-50/30 dark:bg-purple-900/5"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{notif.title}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{notif.message}</p>
                                                    <p className="text-[10px] text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                                                </div>
                                                <span className="w-2 h-2 bg-[#8b5cf6] rounded-full self-start mt-2 shrink-0"></span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                                        No new notifications
                                    </div>
                                )}
                            </div>
                            <div className="p-3 border-t border-gray-100 dark:border-gray-700">
                                <Link
                                    to="/admin/notifications"
                                    onClick={() => setShowNotifications(false)}
                                    className="block w-full py-2 text-xs font-bold text-center text-[#8b5cf6] bg-[#8b5cf6]/5 hover:bg-[#8b5cf6]/10 rounded-xl transition-all"
                                >
                                    View All History
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 pl-4 border-l border-gray-100 dark:border-gray-700">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">{user?.name || 'Admin User'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {user?.role === 'SuperAdmin' ? 'Super Admin' : 'Admin'}
                        </p>
                    </div>
                    <Link to="/admin/settings">
                        <img
                            src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80"}
                            alt="Admin"
                            className="w-9 h-9 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700 cursor-pointer"
                        />
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
