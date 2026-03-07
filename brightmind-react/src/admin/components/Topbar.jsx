import React, { useState, useEffect } from 'react';
import { Search, Bell, Sun, Moon, Menu, X, Check } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Topbar = ({ toggleMobileSidebar }) => {
    const { user } = useUser();
    const { isDarkMode, toggleTheme } = useTheme();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                // Fetch Notifications
                const notifRes = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/notifications?role=Admin`);
                setNotifications(notifRes.data);
            } catch (err) {
                console.error("Failed to fetch notifications", err);
            }
        };

        fetchNotifications();
        // Optional: Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = async (id) => {
        try {
            await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error(err);
        }
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
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors relative"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden animate-fadeIn">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                                <span className="text-xs bg-[#8b5cf6]/10 text-[#8b5cf6] px-2 py-1 rounded-full">{unreadCount} New</span>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    <div className="divide-y divide-gray-50 dark:divide-gray-700">
                                        {notifications.map((notif) => (
                                            <div key={notif.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex gap-3 ${!notif.read ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''}`}>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{notif.title}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.message}</p>
                                                    <p className="text-[10px] text-gray-400 mt-2">{new Date(notif.createdAt).toLocaleString()}</p>
                                                </div>
                                                {!notif.read && (
                                                    <button onClick={() => markAsRead(notif.id)} className="text-[#8b5cf6] hover:text-purple-700 p-1 self-start" title="Mark as read">
                                                        <Check size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                                        No new notifications
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 pl-4 border-l border-gray-100 dark:border-gray-700">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">{user?.name || 'Admin User'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Super Admin</p>
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
