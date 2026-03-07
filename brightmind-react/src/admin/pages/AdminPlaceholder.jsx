import React from 'react';
import { Construction } from 'lucide-react';

const AdminPlaceholder = ({ title }) => {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
            <div className="bg-purple-50 p-6 rounded-full rotate-12">
                <Construction size={64} className="text-[#8b5cf6]" />
            </div>
            <div className="max-w-md">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
                <p className="text-gray-500">
                    This module is under development for Phase-2. Stay tuned for updates!
                </p>
            </div>
            <button className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                Go Back Home
            </button>
        </div>
    );
};

export default AdminPlaceholder;
