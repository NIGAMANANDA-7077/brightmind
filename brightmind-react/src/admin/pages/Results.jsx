import React, { useState } from 'react';
import { AdminResultsProvider, useAdminResults } from '../context/AdminResultsContext';
import ResultsFilterBar from '../components/results/ResultsFilterBar';
import ResultsTable from '../components/results/ResultsTable';
import StudentResultDrawer from '../components/results/StudentResultDrawer';
import { TrendingUp, Users, CheckCircle, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const ResultsContent = () => {
    const { resultStats } = useAdminResults();
    const [selectedResult, setSelectedResult] = useState(null);

    // Mock data for Line Chart (Visual Only)
    const trendData = [
        { name: 'Jan', attempts: 120 },
        { name: 'Feb', attempts: 180 },
        { name: 'Mar', attempts: 150 },
        { name: 'Apr', attempts: 250 },
        { name: 'May', attempts: 320 },
        { name: 'Jun', attempts: 400 },
    ];

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 animate-fadeIn pb-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Results & Analytics</h1>
                    <p className="text-gray-500">Comprehensive student performance analysis</p>
                </div>
                <div className="flex bg-white border border-gray-200 rounded-lg p-1 self-start">
                    <button className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-900 rounded-md">Last 6 Months</button>
                    <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-900">Year</button>
                </div>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Attempts</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{resultStats.totalAttempts}</h3>
                    </div>
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                        <Users size={22} />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avg Score</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{resultStats.avgScore}%</h3>
                    </div>
                    <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                        <TrendingUp size={22} />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pass Rate</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{resultStats.passPercentage}%</h3>
                    </div>
                    <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
                        <CheckCircle size={22} />
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Highest Score</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{resultStats.highestScore}</h3>
                    </div>
                    <div className="p-2.5 bg-yellow-50 text-yellow-600 rounded-xl">
                        <Award size={22} />
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <ResultsFilterBar />

            {/* Main Content Area */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Table Section */}
                <div className="xl:col-span-2 space-y-4">
                    <ResultsTable onViewDetails={setSelectedResult} />
                </div>

                {/* Trend Chart (Side Widget) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
                    <h3 className="font-bold text-gray-900 mb-6">Performance Trend</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="attempts"
                                    stroke="#111827"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#111827', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, fill: '#8b5cf6' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Student Drawer */}
            <StudentResultDrawer
                isOpen={!!selectedResult}
                result={selectedResult}
                onClose={() => setSelectedResult(null)}
            />

        </div>
    );
};

const Results = () => {
    return (
        <AdminResultsProvider>
            <ResultsContent />
        </AdminResultsProvider>
    );
};

export default Results;
