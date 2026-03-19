import React, { useState, useMemo } from 'react';
import { AdminResultsProvider, useAdminResults } from '../context/AdminResultsContext';
import ResultsFilterBar from '../components/results/ResultsFilterBar';
import ResultsTable from '../components/results/ResultsTable';
import StudentResultDrawer from '../components/results/StudentResultDrawer';
import { TrendingUp, Users, CheckCircle, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const ResultsContent = () => {
    const { resultStats, allResults } = useAdminResults();
    const [selectedResult, setSelectedResult] = useState(null);
    const [trendPeriod, setTrendPeriod] = useState('6months'); // '6months' | 'year'

    // Compute Performance Trend from real result data grouped by month
    const trendData = useMemo(() => {
        const now = new Date();
        const monthCount = trendPeriod === 'year' ? 12 : 6;

        // Build last N months labels
        const months = [];
        for (let i = monthCount - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                key: `${d.getFullYear()}-${d.getMonth()}`,
                label: d.toLocaleString('default', { month: 'short' }),
                scores: [],
                attempts: 0,
            });
        }

        // Bucket each result into the correct month
        (allResults || []).forEach(r => {
            const date = r.submittedAt ? new Date(r.submittedAt) : null;
            if (!date) return;
            const key = `${date.getFullYear()}-${date.getMonth()}`;
            const bucket = months.find(m => m.key === key);
            if (bucket) {
                bucket.scores.push(r.totalScore || 0);
                bucket.attempts++;
            }
        });

        return months.map(m => ({
            name: m.label,
            avgScore: m.scores.length > 0 ? Math.round(m.scores.reduce((a, b) => a + b, 0) / m.scores.length) : 0,
            attempts: m.attempts,
        }));
    }, [allResults, trendPeriod]);

    // Dynamic Y-axis domain
    const maxVal = trendData.length > 0 ? Math.max(...trendData.map(d => d.avgScore), 1) : 10;
    const yMax = Math.ceil(maxVal * 1.3 / 5) * 5 || 10;

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 animate-fadeIn pb-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Results & Analytics</h1>
                    <p className="text-gray-500">Comprehensive student performance analysis</p>
                </div>
                <div className="flex bg-white border border-gray-200 rounded-lg p-1 self-start">
                    <button
                        onClick={() => setTrendPeriod('6months')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${trendPeriod === '6months' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                    >Last 6 Months</button>
                    <button
                        onClick={() => setTrendPeriod('year')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${trendPeriod === 'year' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                    >Year</button>
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
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-gray-900">Performance Trend</h3>
                    </div>
                    <p className="text-xs text-gray-400 mb-4">Avg score per month based on exam results</p>
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
                                    domain={[0, yMax]}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                                    formatter={(value, name) => [
                                        name === 'avgScore' ? `${value} pts` : value,
                                        name === 'avgScore' ? 'Avg Score' : 'Attempts'
                                    ]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="avgScore"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, fill: '#7c3aed' }}
                                    connectNulls
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Summary below chart */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-center">
                        <div>
                            <p className="text-xs text-gray-400">Total Attempts</p>
                            <p className="text-sm font-bold text-gray-800">{trendData.reduce((s, d) => s + d.attempts, 0)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Peak Avg Score</p>
                            <p className="text-sm font-bold text-purple-600">{Math.max(...trendData.map(d => d.avgScore))} pts</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Active Months</p>
                            <p className="text-sm font-bold text-gray-800">{trendData.filter(d => d.attempts > 0).length}</p>
                        </div>
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
