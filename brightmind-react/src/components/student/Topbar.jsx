import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Menu, X, CheckSquare, Sun, Moon, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';

const Topbar = ({ onMenuClick }) => {
    const { user } = useUser();
    const { isDarkMode, toggleTheme } = useTheme();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                // Fetch All & Student role notifications
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/notifications?role=Student`);
                setNotifications(res.data);
            } catch (err) {
                console.error("Failed to fetch notifications", err);
            }
        };

        fetchNotifications();
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
        <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 h-20 px-6 flex items-center justify-between sticky top-0 z-30 transition-colors hover:shadow-sm">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg lg:hidden"
                >
                    <Menu size={24} />
                </button>

                {/* Search Bar - Hidden on small mobile */}
                <div className="hidden md:flex items-center bg-gray-50 dark:bg-gray-700 px-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-600 focus-within:border-[#8b5cf6] focus-within:ring-2 focus-within:ring-[#8b5cf6]/10 w-64 lg:w-96 transition-all duration-300">
                    <Search size={18} className="text-gray-400 dark:text-gray-300" />
                    <input
                        type="text"
                        placeholder="Search courses, mentors..."
                        className="bg-transparent border-none outline-none text-sm ml-2 w-full text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-400"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors relative"
                >
                    {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
                </button>

                {/* Notifications Button & Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-2 transition-colors rounded-full ${showNotifications ? 'bg-[#8b5cf6]/10 text-[#8b5cf6]' : 'text-gray-400 dark:text-gray-400 hover:text-[#8b5cf6] hover:bg-[#8b5cf6]/5 dark:hover:bg-gray-700'}`}
                    >
                        <Bell size={22} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                        )}
                    </button>

                    {/* Dropdown overlay */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-4 z-50 animate-fade-in">
                            <div className="px-6 pb-4 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between">
                                <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                                <button onClick={() => setShowNotifications(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="max-h-[400px] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((notif) => (
                                        <div key={notif.id} className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-50 dark:border-gray-700 last:border-0 group flex justify-between gap-2 ${!notif.read ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''}`}>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#8b5cf6] transition-colors">{notif.title}</h4>
                                                    <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{notif.message}</p>
                                            </div>
                                            {!notif.read && (
                                                <button onClick={() => markAsRead(notif.id)} className="text-[#8b5cf6] hover:text-purple-700 p-1 self-start" title="Mark as read">
                                                    <Check size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-6 py-10 text-center">
                                        <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">No new notifications</p>
                                    </div>
                                )}
                            </div>
                            {notifications.length > 0 && (
                                <div className="px-6 pt-4 border-t border-gray-50 dark:border-gray-700">
                                    <button className="w-full py-2.5 text-xs font-bold text-[#8b5cf6] bg-[#8b5cf6]/5 hover:bg-[#8b5cf6]/10 rounded-xl transition-all">
                                        View All
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <Link to="/student/settings" className="flex items-center gap-3 pl-4 border-l border-gray-100 dark:border-gray-700 hover:opacity-80 transition-opacity group">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">{user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{user?.role}</p>
                    </div>
                    <div className="relative">
                        <img
                            src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Student'}
                            alt="Profile"
                            className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 shadow-md object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                    </div>
                </Link>
            </div>
        </header>
    );
};

export default Topbar;
