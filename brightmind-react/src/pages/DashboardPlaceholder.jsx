import React from 'react';
import { useParams, Link } from 'react-router-dom';

const DashboardPlaceholder = ({ role }) => {
    const getRoleColor = () => {
        switch (role) {
            case 'Student': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Teacher': return 'bg-green-100 text-green-700 border-green-200';
            case 'Admin': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
                <div className={`inline-block px-4 py-2 rounded-full font-bold text-sm mb-6 border ${getRoleColor()}`}>
                    {role} Dashboard
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome back!</h1>
                <p className="text-gray-500 mb-8">
                    This is a placeholder for the <b>{role} Dashboard</b>.
                    You can integrate your existing student panel project here.
                </p>

                <div className="space-y-3">
                    <button className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors">
                        View Analytics
                    </button>
                    <Link to="/" className="block w-full bg-gray-100 text-gray-900 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                        Go Home
                    </Link>
                    <Link to="/login" className="block w-full text-red-500 py-2 text-sm font-medium hover:underline">
                        Log Out
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DashboardPlaceholder;
