import React from 'react';

const StudentCourses = () => {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 bg-white rounded-3xl border border-gray-100">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">🚧</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Work in Progress</h2>
            <p className="text-gray-500 max-w-md">
                This page is part of Phase 2. The navigation and routing are set up correctly!
            </p>
        </div>
    );
};

export default StudentCourses;
