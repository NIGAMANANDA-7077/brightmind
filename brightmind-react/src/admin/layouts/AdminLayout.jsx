import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import ImpersonationBanner from '../components/ImpersonationBanner';
import { AdminResultsProvider } from '../context/AdminResultsContext';
import { useUser } from '../../context/UserContext';

const AdminLayout = () => {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const { user, loading } = useUser();

    if (loading) return null;
    if (!user || !['Admin', 'SuperAdmin'].includes(user.role)) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="flex flex-col min-h-screen theme-surface transition-colors duration-300">
            <ImpersonationBanner />
            <div className="flex theme-surface flex-1">
                {/* Sidebar */}
                <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

                <div className="flex-1 flex flex-col min-w-0 md:ml-64 transition-all duration-300">
                    <Topbar toggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

                    <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                        <AdminResultsProvider>
                            <Outlet />
                        </AdminResultsProvider>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
