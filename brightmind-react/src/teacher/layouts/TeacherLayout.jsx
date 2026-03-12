import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { TeacherProvider } from '../context/TeacherContext';
import { useUser } from '../../context/UserContext';

// =========================================================
// TeacherLayout — mirrors AdminLayout pattern
// =========================================================

const TeacherLayout = () => {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const { user, loading } = useUser();

    if (loading) return null;
    if (!user || user.role !== 'Teacher') {
        return <Navigate to="/login" replace />;
    }

    return (
        <TeacherProvider>
            <div className="flex bg-gray-50 min-h-screen">
                {/* Sidebar */}
                <Sidebar
                    isOpen={mobileSidebarOpen}
                    onClose={() => setMobileSidebarOpen(false)}
                />

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 md:ml-64 transition-all duration-300">
                    <Topbar toggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

                    <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </TeacherProvider>
    );
};

export default TeacherLayout;
