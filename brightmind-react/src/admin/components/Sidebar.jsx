import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    FileText,
    ClipboardList,
    Users,
    Megaphone,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    X,
    Layers,
    Video,
    UserCheck,
    ShieldCheck,
    Newspaper
} from 'lucide-react';
import { useUser } from '../../context/UserContext';


const Sidebar = ({ isOpen, onClose }) => {
    const [collapsed, setCollapsed] = useState(false);
    const { user } = useUser();

    const navItems = user?.role === 'SuperAdmin' 
        ? [
            { to: '/admin/admin-management', icon: ShieldCheck, label: 'Admin Management' },
            { to: '/admin/blogs', icon: Newspaper, label: 'Blog Posts' },
          ]
        : [
            { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
            { to: '/admin/exams', icon: FileText, label: 'Exams' },
            { to: '/admin/results', icon: ClipboardList, label: 'Results' },
            { to: '/admin/users', icon: Users, label: 'Users' },
            { to: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
            { to: '/admin/live-classes', icon: Video, label: 'Live Classes' },
            { to: '/admin/batches', icon: Layers, label: 'Batches' },
            { to: '/admin/enrollment-requests', icon: UserCheck, label: 'Enrollments' },
            { to: '/admin/blogs', icon: Newspaper, label: 'Blog Posts' },
            { to: '/admin/settings', icon: Settings, label: 'Settings' },
        ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden glass-effect"
                    onClick={onClose}
                />
            )}

            <aside
                className={`bg-white border-r border-gray-100 shadow-xl h-screen fixed top-0 left-0 z-50 flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
            >
                {/* Header */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
                    <h1 className={`font-bold tracking-tight text-[#8b5cf6] transition-all duration-300 ${collapsed ? 'text-xs text-center w-full' : 'text-2xl'}`}>
                        {collapsed ? 'BM' : 'BrightMIND'}
                    </h1>
                    {/* Mobile Close Button */}
                    <button onClick={onClose} className="md:hidden text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 hide-scrollbar">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/admin/dashboard'}
                            onClick={onClose}
                            className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium
                ${isActive
                                    ? 'bg-[#8b5cf6]/10 text-[#8b5cf6]'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
              `}
                        >
                            <item.icon size={22} className={collapsed ? 'mx-auto' : ''} />
                            {!collapsed && (
                                <span>{item.label}</span>
                            )}
                        </NavLink>
                    ))}

                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100">
                    <NavLink
                        to="/login"
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors group font-medium"
                    >
                        <LogOut size={20} className={collapsed ? 'mx-auto' : ''} />
                        {!collapsed && <span>Logout</span>}
                    </NavLink>
                </div>

                {/* Collapse Toggle - Only visible on desktop */}
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
