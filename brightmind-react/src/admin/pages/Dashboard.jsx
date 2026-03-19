import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { upcomingExams, quickActions, activityFeed } from '../data/adminDashboardMock';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
    MoreVertical, ArrowUpRight, Clock, Users, BookOpen, FileText, CheckCircle, Loader2
} from 'lucide-react';
import { useUser } from '../../context/UserContext';

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

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [upcomingExamsList, setUpcomingExamsList] = useState([]);
    const [enrollmentChart, setEnrollmentChart] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const [dashRes, examRes, analyticsRes] = await Promise.allSettled([
                api.get('/admin/dashboard'),
                api.get('/exams/teacher'),
                api.get('/users/analytics/monthly')
            ]);

            if (dashRes.status === 'fulfilled' && dashRes.value.data?.success) {
                const d = dashRes.value.data.data;
                setStats(d.stats);
                setActivities(d.recentActivity || []);
                setEnrollmentChart(d.enrollmentChart || []);
            }

            if (analyticsRes.status === 'fulfilled' && analyticsRes.value.data?.success) {
                const chartData = analyticsRes.value.data.data?.enrollments;
                if (chartData?.length) setEnrollmentChart(chartData);
            }

            const examList = examRes.status === 'fulfilled' ? (examRes.value.data || []) : [];
            const now = new Date();
            const upcoming = examList
                .filter(e => e.scheduledAt && new Date(e.scheduledAt) > now)
                .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
                .slice(0, 3);
            setUpcomingExamsList(upcoming);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

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
                <p className="text-gray-500">Welcome back, {user?.role === 'SuperAdmin' ? 'Super Admin' : 'Admin'}! Real-time overview of your LMS performance.</p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { value: stats?.totalStudents || 0, title: 'Total Students', change: 'Live', trend: 'up', icon: Users, color: 'bg-purple-100 text-purple-600', link: '/admin/users' },
                    { value: stats?.activeCourses || 0, title: 'Active Courses', change: 'Published', trend: 'up', icon: BookOpen, color: 'bg-blue-100 text-blue-600', link: '/admin/courses' },
                    { value: stats?.totalExams || 0, title: 'Total Exams', change: 'All time', trend: 'neutral', icon: FileText, color: 'bg-orange-100 text-orange-600', link: '/admin/exams' },
                    { value: stats?.totalTeachers || 0, title: 'Active Teachers', change: 'Verified', trend: 'neutral', icon: Users, color: 'bg-green-100 text-green-600', link: '/admin/users' },
                    { value: stats?.pendingRequests || 0, title: 'Pending Requests', change: 'Needs review', trend: stats?.pendingRequests > 0 ? 'down' : 'neutral', icon: CheckCircle, color: 'bg-yellow-100 text-yellow-600', link: '/admin/enrollment-requests' },
                ].map((stat, index) => (
                    <StatCard key={index} stat={stat} />
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Chart Section */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Monthly Enrollments</h2>
                        <span className="text-xs font-bold text-[#8b5cf6] bg-[#8b5cf6]/10 px-3 py-1 rounded-full">Last 12 Months</span>
                    </div>
                    <div className="h-80 w-full min-h-[320px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <AreaChart data={enrollmentChart}>
                                <defs>
                                    <linearGradient id="colorChart" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(val) => [val, 'Enrollments']}
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
            <div className="grid grid-cols-1 gap-6">

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
        </div>
    );
};

export default Dashboard;
