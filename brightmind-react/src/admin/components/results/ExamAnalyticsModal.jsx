import React from 'react';
import { X, Trophy, Download, Calendar, User, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ExamAnalyticsModal = ({ isOpen, onClose, exam }) => {
    if (!isOpen || !exam) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Drawer */}
            <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl animate-slideLeft overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{exam.examName}</h2>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><Calendar size={14} /> {exam.date}</span>
                            <span className="flex items-center gap-1"><User size={14} /> {exam.attempts} Attempts</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Score Distribution Chart */}
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 text-sm">Score Distribution</h3>
                            <button className="text-xs font-medium text-purple-600 hover:underline">View Full Report</button>
                        </div>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <BarChart data={exam.distribution}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 10 }} />
                                    <Tooltip
                                        cursor={{ fill: '#F3F4F6' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'none' }}
                                    />
                                    <Bar dataKey="count" fill="#111827" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Performers List */}
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm mb-4">Top 5 Performers</h3>
                        <div className="space-y-3">
                            {exam.topPerformers.map((student, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:border-gray-300 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white
                                            ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-200 text-gray-600'}
                                        `}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{student.name}</p>
                                            <p className="text-xs text-gray-500">Rank #{index + 1}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900">{student.score}%</p>
                                        <p className="text-xs text-green-600">Passed</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Area */}
                    <div className="pt-6 border-t border-gray-100">
                        <button className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors">
                            <Download size={18} /> Download Full CSV Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamAnalyticsModal;
