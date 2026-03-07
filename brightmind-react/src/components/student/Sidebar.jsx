import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Video, MessageSquare, User, Calendar, FileText, FileQuestion, Award, Settings, LogOut, X } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    const links = [
        { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
        { name: 'My Courses', path: '/student/courses', icon: BookOpen },
        { name: 'Live Classes', path: '/student/live', icon: Video },
        { name: 'Discussion Forum', path: '/student/forum', icon: MessageSquare },
        { name: 'Assignments', path: '/student/assignments', icon: FileText },
        { name: 'Exams & Quizzes', path: '/student/exams', icon: FileQuestion },
        { name: 'Certificates', path: '/student/certificates', icon: Award },
        { name: 'Settings', path: '/student/settings', icon: Settings },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden glass-effect"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold tracking-tight text-[#8b5cf6]">
                            BrightMIND
                        </span>
                    </div>
                    <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-80px)] hide-scrollbar">
                    {links.map((link) => {
                        const Icon = link.icon;
                        return (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                onClick={onClose} // Close sidebar on mobile click
                                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                  ${isActive
                                        ? 'bg-[#8b5cf6]/10 text-[#8b5cf6]'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }
                `}
                            >
                                <Icon size={20} />
                                {link.name}
                            </NavLink>
                        );
                    })}

                    <div className="pt-4 mt-4 border-t border-gray-100">
                        <NavLink
                            to="/login"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200 font-medium"
                        >
                            <LogOut size={20} />
                            Logout
                        </NavLink>
                    </div>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
