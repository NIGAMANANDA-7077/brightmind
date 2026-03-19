import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import api from '../../utils/axiosConfig';
import { MoreVertical, Plus, BookOpen, ClipboardList, UserPlus, CheckCircle, Loader2, Video, Calendar, Clock, Users, AlertCircle } from 'lucide-react';

const StatCard = ({ stat }) => {
    const navigate = useNavigate();
    const [count, setCount] = useState(0);

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

    const Icon = stat.iconComponent;
    return (
        <div
            onClick={() => navigate(stat.link)}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.color} transition-transform group-hover:scale-110`}>
                    <Icon size={24} />
                </div>
            </div>
            <div>
                <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
                <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-gray-900">{count.toLocaleString()}</span>
                    {stat.change && (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.trend === 'up' ? 'bg-green-100 text-green-700' : stat.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                            {stat.change}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [dashData, setDashData] = useState(null);
    const [activity, setActivity] = useState([]);
    const [forumThreads, setForumThreads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user?.id) return;
            try {
                const [dashRes, activityRes, forumRes] = await Promise.all([
                    api.get('/teacher/dashboard'),
                    api.get('/users/activity').catch(() => ({ data: { activities: [] } })),
                    api.get('/forum?limit=3').catch(() => ({ data: [] }))
                ]);
                if (dashRes.data.success) setDashData(dashRes.data.data);
                if (activityRes.data?.success) setActivity(activityRes.data.activities || []);
                setForumThreads(Array.isArray(forumRes.data) ? forumRes.data.slice(0, 3) : []);
            } catch (err) {
                console.error("Dashboard data fetch failed", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(interval);
    }, [user?.id]);

    const quickActions = [
        { label: 'Add Assignment', icon: ClipboardList, path: '/teacher/assignments' },
        { label: 'Live Classes', icon: Video, path: '/teacher/live' },
        { label: 'View Students', icon: UserPlus, path: '/teacher/students' },
        { label: 'My Courses', icon: BookOpen, path: '/teacher/courses' },
    ];

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-[#8b5cf6]" size={40} />
        </div>
    );

    const s = dashData?.stats || {};
    const statCards = [
        { value: s.totalCourses || 0, title: 'My Courses', change: null, trend: 'up', iconComponent: BookOpen, color: 'bg-purple-100 text-purple-600', link: '/teacher/courses' },
        { value: s.totalStudents || 0, title: 'Total Students', change: null, trend: 'up', iconComponent: Users, color: 'bg-blue-100 text-blue-600', link: '/teacher/students' },
        { value: s.totalAssignments || 0, title: 'Assignments', change: null, trend: 'neutral', iconComponent: ClipboardList, color: 'bg-orange-100 text-orange-600', link: '/teacher/assignments' },
        { value: s.pendingGrading || 0, title: 'Pending Grading', change: s.pendingGrading > 0 ? 'Action needed' : 'All clear', trend: s.pendingGrading > 0 ? 'down' : 'neutral', iconComponent: AlertCircle, color: s.pendingGrading > 0 ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-600', link: '/teacher/assignments' },
    ];

    const upcomingClasses = dashData?.upcoming_live_classes || [];
    const pendingSubmissions = dashData?.pending_submissions || [];

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
                <p className="text-gray-500">Welcome back, {user?.name?.split(' ')[0] || 'Teacher'}! Here's your teaching overview.</p>
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
                {statCards.map((stat, idx) => (
                    <StatCard key={idx} stat={stat} />
                ))}
            </div>

            {/* Upcoming Live Classes */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Video className="text-[#8b5cf6]" size={20} />
                        Upcoming Live Classes
                    </h2>
                    <button onClick={() => navigate('/teacher/live')} className="text-[#8b5cf6] text-sm font-bold hover:underline">
                        Manage Classes
                    </button>
                </div>
                {upcomingClasses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingClasses.map(cls => (
                            <div key={cls.id} className="p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-colors">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-[#8b5cf6]">
                                        <Video size={14} />
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cls.status === 'Live' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                        {cls.status}
                                    </span>
                                </div>
                                <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">{cls.title}</h4>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {cls.classDate}</span>
                                    <span className="flex items-center gap-1"><Clock size={12} /> {cls.startTime}</span>
                                </div>
                                {cls.meetingLink && (
                                    <a href={cls.meetingLink} target="_blank" rel="noopener noreferrer"
                                        className="mt-3 w-full block text-center py-1.5 bg-[#8b5cf6] text-white text-xs font-bold rounded-lg hover:bg-[#7c3aed] transition-colors">
                                        Start Class
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <Video size={32} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No upcoming live classes scheduled.</p>
                        <button onClick={() => navigate('/teacher/live')} className="mt-2 text-[#8b5cf6] text-xs font-bold hover:underline">Schedule one now →</button>
                    </div>
                )}
            </div>

            {/* Recent Activity & Pending Submissions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Submissions */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <AlertCircle className={s.pendingGrading > 0 ? "text-red-500" : "text-green-500"} size={20} />
                            Pending Grading
                            {s.pendingGrading > 0 && (
                                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{s.pendingGrading}</span>
                            )}
                        </h2>
                        <button onClick={() => navigate('/teacher/assignments')} className="text-[#8b5cf6] text-sm font-bold hover:underline">View All</button>
                    </div>
                    {pendingSubmissions.length > 0 ? (
                        <div className="space-y-3">
                            {pendingSubmissions.slice(0, 5).map(sub => (
                                <div key={sub.id} className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 border border-orange-100">
                                    <img
                                        src={sub.student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.student?.name || 'S')}&background=8b5cf6&color=fff`}
                                        className="w-8 h-8 rounded-full object-cover"
                                        alt={sub.student?.name}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">{sub.student?.name}</p>
                                        <p className="text-xs text-gray-500">Submitted {getTimeAgo(sub.createdAt)}</p>
                                    </div>
                                    <button onClick={() => navigate('/teacher/assignments')}
                                        className="text-xs font-bold text-[#8b5cf6] hover:underline whitespace-nowrap">
                                        Grade
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <CheckCircle size={32} className="mx-auto mb-2 text-green-400" />
                            <p className="text-sm font-medium text-green-600">All submissions graded! 🎉</p>
                        </div>
                    )}
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <CheckCircle className="text-green-500" size={20} />
                        Recent Activity
                    </h2>
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
            </div>

            {/* Forum Discussions & Tips */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Forum Discussions */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Recent Discussions</h2>
                        <button onClick={() => navigate('/teacher/forum')} className="text-[#8b5cf6] text-sm font-bold hover:underline">View All</button>
                    </div>
                    <div className="space-y-4 flex-1">
                        {forumThreads.length > 0 ? forumThreads.map((thread) => (
                            <div
                                key={thread.id}
                                onClick={() => navigate(`/teacher/forum/thread/${thread.id}`)}
                                className="p-4 rounded-xl border border-gray-50 hover:border-[#8b5cf6]/30 hover:bg-[#8b5cf6]/5 transition-all cursor-pointer group"
                            >
                                <h4 className="font-bold text-gray-900 text-sm group-hover:text-[#8b5cf6] transition-colors line-clamp-1">{thread.title}</h4>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                        <UserPlus size={12} /> {thread.authorName}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                        <ClipboardList size={12} /> {getTimeAgo(thread.createdAt)}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="h-full flex flex-col items-center justify-center text-center py-10">
                                <p className="text-gray-400 text-sm italic">No recent discussions found.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tips Card */}
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
                                Schedule live classes to boost student engagement.
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
