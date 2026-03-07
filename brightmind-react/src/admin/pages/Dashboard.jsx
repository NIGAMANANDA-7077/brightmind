import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { upcomingExams, recentUploads, quickActions, activityFeed } from '../data/adminDashboardMock';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
    MoreVertical, ArrowUpRight, Clock, Eye, File, Video, Download, X, Users, BookOpen, FileText, CheckCircle, Loader2
} from 'lucide-react';

// --- Components ---

const StatCard = ({ stat }) => {
    const navigate = useNavigate();
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = typeof stat.value === 'number' ? stat.value : parseInt(stat.value?.toString().replace(/[^0-9]/g, ''), 10) || 0;

        if (end === 0) {
            setCount(0);
            return;
        }

        const duration = 1500;
        const increment = end / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [stat.value]);

    return (
        <div
            onClick={() => stat.link && navigate(stat.link)}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.color} transition-transform group-hover:scale-110`}>
                    <stat.icon size={24} />
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={18} />
                </button>
            </div>
            <div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
                <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                        {typeof stat.value === 'string' && !stat.value.match(/^\d+$/) ? stat.value : count.toLocaleString()}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-green-100 text-green-700' : stat.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                        {stat.change}
                    </span>
                </div>
            </div>
        </div>
    );
};

const CountdownTimer = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const target = new Date(targetDate);
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft('Started');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            if (days > 0) setTimeLeft(`${days}d ${hours}h`);
            else setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    return <span className="font-mono text-xs font-medium text-[#8b5cf6] bg-[#8b5cf6]/10 px-2 py-1 rounded-md">{timeLeft}</span>;
};

// --- Main Dashboard ---

import api from '../../utils/axiosConfig';
import { useAdminCourses } from '../context/AdminCourseContext';

const Dashboard = () => {
    const { mediaAssets } = useAdminCourses();
    const navigate = useNavigate();
    const [activeChart, setActiveChart] = useState('enrollments');
    const [previewFile, setPreviewFile] = useState(null);
    const [realStats, setRealStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [upcomingExamsList, setUpcomingExamsList] = useState([]);
    const [mediaList, setMediaList] = useState([]);
    const [monthlyData, setMonthlyData] = useState({ enrollments: [], attempts: [], creations: [] });
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const [userStats, courseRes, examRes, activityRes, analyticsRes] = await Promise.all([
                api.get('/users/stats'),
                api.get('/courses'),
                api.get('/exams'),
                api.get('/activities'),
                api.get('/users/analytics/monthly')
            ]);

            setActivities(activityRes.data.slice(0, 10)); // Top 10 activities

            if (analyticsRes.data.success) {
                setMonthlyData(analyticsRes.data.data);
            }

            // Map Exams to Upcoming
            const now = new Date();
            const upcoming = examRes.data
                .filter(e => e.scheduledAt && new Date(e.scheduledAt) > now)
                .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
                .slice(0, 3);

            setUpcomingExamsList(upcoming);

            // Map Media
            setMediaList(mediaAssets.slice(0, 5));

            setRealStats([
                {
                    value: userStats.data.students,
                    title: 'Total Students',
                    change: '+12%',
                    trend: 'up',
                    icon: Users,
                    color: 'bg-purple-100 text-purple-600',
                    link: '/admin/users'
                },
                {
                    value: courseRes.data.length,
                    title: 'Active Courses',
                    change: '+5%',
                    trend: 'up',
                    icon: BookOpen,
                    color: 'bg-blue-100 text-blue-600',
                    link: '/admin/courses'
                },
                {
                    value: examRes.data.length,
                    title: 'Total Exams',
                    change: 'Real-time',
                    trend: 'neutral',
                    icon: FileText,
                    color: 'bg-orange-100 text-orange-600',
                    link: '/admin/exams/schedule'
                },
                {
                    value: userStats.data.teachers || 0,
                    title: 'Active Teachers',
                    change: 'Verified',
                    trend: 'neutral',
                    icon: Users,
                    color: 'bg-green-100 text-green-600',
                    link: '/admin/users'
                }
            ]);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [mediaAssets]);

    if (loading) {
        return (
            <div className="h-[80vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-[#8b5cf6]" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Welcome back, Admin! Real-time overview of your LMS performance.</p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4">
                {quickActions.map((action, idx) => (
                    <button
                        key={idx}
                        onClick={() => navigate(action.path)}
                        className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 hover:border-[#8b5cf6] hover:text-[#8b5cf6] transition-all font-medium text-sm text-gray-700"
                    >
                        <action.icon size={16} />
                        {action.label}
                    </button>
                ))}
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {realStats.map((stat, index) => (
                    <StatCard key={index} stat={stat} />
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Monthly Analytics</h2>
                        <div className="flex bg-gray-50 rounded-lg p-1">
                            {['enrollments', 'attempts', 'creations'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setActiveChart(type)}
                                    className={`px-3 py-1 text-xs font-bold rounded-md capitalize transition-all ${activeChart === type ? 'bg-white shadow text-[#8b5cf6]' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-80 w-full min-h-[320px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <AreaChart data={monthlyData[activeChart] || []}>
                                <defs>
                                    <linearGradient id="colorChart" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorChart)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Upcoming Exams Panel */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Upcoming Exams</h2>
                        <button onClick={() => navigate('/admin/exams/schedule')} className="text-[#8b5cf6] text-xs font-bold hover:underline">View Calendar</button>
                    </div>
                    <div className="space-y-4">
                        {upcomingExamsList.map((exam) => (
                            <div key={exam.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#8b5cf6]/30 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-900 line-clamp-1">{exam.title}</h4>
                                    <CountdownTimer targetDate={exam.scheduledAt} />
                                </div>
                                <p className="text-xs text-gray-500 mb-3">{exam.courseName}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <Clock size={12} />
                                    {new Date(exam.scheduledAt).toLocaleString()}
                                </div>
                            </div>
                        ))}
                        {upcomingExamsList.length === 0 && (
                            <p className="text-center text-gray-400 py-6 text-sm italic">No upcoming exams</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Recent Uploads Table */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Recent Uploads</h2>
                        <button onClick={() => navigate('/admin/media')} className="text-[#8b5cf6] text-xs font-bold hover:underline">Manage Media</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                                    <th className="pb-3 pl-2">File Name</th>
                                    <th className="pb-3">Type</th>
                                    <th className="pb-3">Size</th>
                                    <th className="pb-3">Date</th>
                                    <th className="pb-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {mediaList.map((file) => (
                                    <tr key={file.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 pl-2 flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${file.type === 'video' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}>
                                                {file.type === 'video' ? <Video size={16} /> : <File size={16} />}
                                            </div>
                                            <span className="font-medium text-gray-700">{file.name}</span>
                                        </td>
                                        <td className="py-3 text-gray-500 capitalize">{file.type}</td>
                                        <td className="py-3 text-gray-500">{file.size || 'N/A'}</td>
                                        <td className="py-3 text-gray-400 text-xs">{new Date(file.createdAt).toLocaleDateString()}</td>
                                        <td className="py-3">
                                            <button
                                                onClick={() => setPreviewFile(file)}
                                                className="p-1.5 text-gray-400 hover:text-[#8b5cf6] hover:bg-[#8b5cf6]/10 rounded-lg transition-colors"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Live Activity</h2>
                    <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                        {activities.map((activity) => (
                            <div key={activity.id} className="relative pl-10">
                                <div className="absolute left-0 top-0 w-10 h-10 flex items-center justify-center bg-white">
                                    <img src={activity.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Default'} alt={activity.user} className="w-8 h-8 rounded-full border border-gray-100" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-900">
                                        <span className="font-bold">{activity.user}</span> {activity.action} <span className="text-[#8b5cf6] font-medium">{activity.target}</span>
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(activity.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                        {activities.length === 0 && (
                            <p className="text-center text-gray-500 py-10">No recent activity.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* File Preview Modal */}
            {previewFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                {previewFile.type === 'Video' ? <Video size={18} /> : <File size={18} />}
                                {previewFile.name}
                            </h3>
                            <button onClick={() => setPreviewFile(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 flex flex-col items-center justify-center bg-gray-50 min-h-[200px]">
                            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                <Eye size={32} />
                            </div>
                            <p className="text-gray-500 text-sm">Preview not available for mock files.</p>
                        </div>
                        <div className="p-4 border-t border-gray-100 flex justify-end">
                            <button className="flex items-center gap-2 text-[#8b5cf6] font-bold text-sm bg-[#8b5cf6]/10 px-4 py-2 rounded-xl hover:bg-[#8b5cf6]/20 transition-colors">
                                <Download size={16} /> Download
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
