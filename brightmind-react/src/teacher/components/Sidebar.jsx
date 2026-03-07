import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    ClipboardList,
    Users,
    Megaphone,
    UserCircle,
    LogOut,
    ChevronLeft,
    ChevronRight,
    X,
    GraduationCap,
    Video,
    FileQuestion,
} from 'lucide-react';

// =========================================================
// Teacher Sidebar — mirrors Admin Sidebar pattern
// =========================================================

const navItems = [
    { to: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/teacher/courses', icon: BookOpen, label: 'Courses' },
    { to: '/teacher/assignments', icon: ClipboardList, label: 'Assignments' },
    { to: '/teacher/students', icon: Users, label: 'Students' },
    { to: '/teacher/live', icon: Video, label: 'Live Classes' },
    { to: '/teacher/announcements', icon: Megaphone, label: 'Announcements' },
    { to: '/teacher/exams', icon: FileQuestion, label: 'Exams' },
    { to: '/teacher/profile', icon: UserCircle, label: 'Profile' },
];

const Sidebar = ({ isOpen, onClose }) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`bg-white border-r border-gray-100 shadow-xl h-screen fixed top-0 left-0 z-50 flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
            >
                {/* Header */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
                    <div className={`flex items-center gap-2 transition-all duration-300 ${collapsed ? 'justify-center w-full' : ''}`}>
                        <div className="bg-[#8b5cf6]/10 p-1.5 rounded-lg">
                            <GraduationCap size={collapsed ? 22 : 20} className="text-[#8b5cf6]" />
                        </div>
                        {!collapsed && (
                            <div>
                                <h1 className="font-bold text-lg tracking-tight text-[#8b5cf6] leading-none">
                                    BrightMIND
                                </h1>
                                <p className="text-xs text-gray-400 font-medium">Teacher Panel</p>
                            </div>
                        )}
                    </div>
                    {/* Mobile Close Button */}
                    <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 hide-scrollbar">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/teacher/dashboard'}
                            onClick={onClose}
                            className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                ${isActive
                                    ? 'bg-[#8b5cf6]/10 text-[#8b5cf6]'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }
              `}
                        >
                            <item.icon size={22} className={collapsed ? 'mx-auto' : ''} />
                            {!collapsed && <span>{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer — Logout */}
                <div className="p-4 border-t border-gray-100">
                    <NavLink
                        to="/login"
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium"
                    >
                        <LogOut size={20} className={collapsed ? 'mx-auto' : ''} />
                        {!collapsed && <span>Logout</span>}
                    </NavLink>
                </div>

                {/* Collapse Toggle — Desktop only */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden md:flex absolute -right-3 top-24 bg-white text-gray-900 p-1.5 rounded-full shadow-md border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </aside>
        </>
    );
};

export default Sidebar;
