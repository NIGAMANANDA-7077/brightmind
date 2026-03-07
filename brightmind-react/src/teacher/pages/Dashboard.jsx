import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import api from '../../utils/axiosConfig';
import { MoreVertical, Plus, BookOpen, ClipboardList, UserPlus, CheckCircle, Loader2 } from 'lucide-react';

const ICON_MAP = {
    BookOpen,
    Users: UserPlus,
    ClipboardList,
    CheckCircle
};

const StatCard = ({ stat }) => {
    const navigate = useNavigate();
    const [count, setCount] = useState(0);
    const Icon = ICON_MAP[stat.icon] || BookOpen;

    useEffect(() => {
        let start = 0;
        const end = typeof stat.value === 'number' ? stat.value : 0;
        const duration = 1200;
        const increment = end / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) { setCount(end); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [stat.value]);

    return (
        <div
            onClick={() => navigate(stat.link)}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.color} transition-transform group-hover:scale-110`}>
                    <Icon size={24} />
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={18} />
                </button>
            </div>
            <div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
                <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-gray-900">{count.toLocaleString()}</span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-green-100 text-green-700' : stat.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                        {stat.change}
                    </span>
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [stats, setStats] = useState([]);
    const [activity, setActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user?.id) return;
            try {
                const [statsRes, activityRes] = await Promise.all([
                    api.get(`/users/teacher/${user.id}/stats`),
                    api.get('/users/activity')
                ]);
                if (statsRes.data.success) setStats(statsRes.data.stats);
                if (activityRes.data.success) setActivity(activityRes.data.activities);
            } catch (err) {
                console.error("Dashboard data fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [user?.id]);

    const quickActions = [
        { label: 'Add Assignment', icon: ClipboardList, path: '/teacher/assignments' },
        { label: 'View Students', icon: UserPlus, path: '/teacher/students' },
        { label: 'My Courses', icon: BookOpen, path: '/teacher/courses' },
    ];

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-[#8b5cf6]" size={40} />
        </div>
    );

    const getTimeAgo = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / 60000);
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="space-y-6 animate-fadeIn pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Welcome back! Here's an overview of your teaching activity.</p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
                {quickActions.map((action, idx) => {
                    const ActionIcon = action.icon;
                    return (
                        <button
                            key={idx}
                            onClick={() => navigate(action.path)}
                            className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 hover:border-[#8b5cf6] hover:text-[#8b5cf6] transition-all font-medium text-sm text-gray-700"
                        >
                            <ActionIcon size={16} />
                            {action.label}
                        </button>
                    );
                })}
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <StatCard key={idx} stat={stat} />
                ))}
            </div>

            {/* Recent Activity & Upcoming Deadlines */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Feed */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h2>
                    <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                        {activity.length > 0 ? activity.map((item) => (
                            <div key={item.id} className="relative pl-10">
                                <div className="absolute left-0 top-0 w-10 h-10 flex items-center justify-center bg-white">
                                    <img src={item.avatar || 'https://ui-avatars.com/api/?name=' + item.user} alt={item.user} className="w-8 h-8 rounded-full border border-gray-100" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-900">
                                        <span className="font-bold">{item.user}</span> {item.action}{' '}
                                        <span className="text-[#8b5cf6] font-medium">{item.target}</span>
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">{getTimeAgo(item.createdAt)}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-gray-400 py-4 italic">No recent activity found.</p>
                        )}
                    </div>
                </div>

                {/* Tips / Info Card */}
                <div className="bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] p-6 rounded-2xl text-white flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-bold mb-2">Tips for Engagement</h2>
                        <ul className="space-y-3 text-sm text-white/90">
                            <li className="flex items-start gap-2">
                                <span className="mt-0.5 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                                Post weekly announcements to keep students informed.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-0.5 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                                Grade assignments within 48 hours for best retention.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-0.5 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                                Upload study material before each new module.
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-0.5 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                                Monitor student progress and reach out to struggling learners.
                            </li>
                        </ul>
                    </div>
                    <button
                        onClick={() => navigate('/teacher/students')}
                        className="mt-6 bg-white text-[#8b5cf6] font-bold text-sm px-4 py-2 rounded-xl hover:bg-white/90 transition-colors self-start"
                    >
                        View All Students →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
