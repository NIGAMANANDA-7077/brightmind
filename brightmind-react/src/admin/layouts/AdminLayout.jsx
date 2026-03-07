import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { AdminResultsProvider } from '../context/AdminResultsContext';

const AdminLayout = () => {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    return (
        <div className="flex bg-gray-50 min-h-screen">
            {/* Sidebar */}
            <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

            {/* Mobile Sidebar Mock (If needed later, for now we rely on desktop sidebar hidden/block logic or drawer implementation) */}
            {/* Ideally, we would have a Mobile drawer here. For Phase-1, sticking to basic response */}

            <div className="flex-1 flex flex-col min-w-0 md:ml-64 transition-all duration-300">
                <Topbar toggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <AdminResultsProvider>
                        <Outlet />
                    </AdminResultsProvider>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
