import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/student/Sidebar';
import Topbar from '../components/student/Topbar';

const StudentLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#f8f9fc] flex">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:ml-64 transition-all duration-300">
                <Topbar onMenuClick={() => setIsSidebarOpen(true)} />

                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StudentLayout;
