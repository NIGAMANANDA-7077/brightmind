import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, MoreVertical, Play, Calendar, User, BookOpen, CheckCircle, Video } from 'lucide-react';
import { studentProfile, upcomingClasses, progressData, notifications } from '../../data/studentData';
import { useCourse } from '../../context/CourseContext';
import { useAssignment } from '../../context/AssignmentContext';
import { useUser } from '../../context/UserContext';
import EnrolledCourseSnapshot from '../../components/student/EnrolledCourseSnapshot';
import { useNavigate } from 'react-router-dom';

import { useSharedAnnouncements } from '../../context/SharedAnnouncementsContext';
import api from '../../utils/axiosConfig';

const Dashboard = () => {
    const { user } = useUser();
    const { courses: enrolledCourses } = useCourse();
    const { assignments } = useAssignment();
    const { announcements } = useSharedAnnouncements();
    const [liveClasses, setLiveClasses] = React.useState([]);
    const [timeframe, setTimeframe] = React.useState('Weekly');
    const navigate = useNavigate();

    React.useEffect(() => {
        const fetchLiveClasses = async () => {
            try {
                const res = await api.get('/live-classes');
                setLiveClasses(res.data);
            } catch (err) {
                console.error("Live classes fetch error:", err);
            }
        };
        fetchLiveClasses();
    }, []);

    const monthlyData = [
        { name: 'Week 1', hours: 15 },
        { name: 'Week 2', hours: 22 },
        { name: 'Week 3', hours: 18 },
        { name: 'Week 4', hours: 25 },
    ];

    const currentChartData = timeframe === 'Weekly' ? progressData : monthlyData;

    return (
        <div className="space-y-8">
            {/* Header / Welcome */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Hello, <span className="text-[#8b5cf6]">{user.name ? user.name.split(' ')[0] : 'Student'}!</span> 👋
                    </h1>
                    <p className="text-gray-500 mt-1">Ready to start learning today?</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                    <Calendar size={18} className="text-[#8b5cf6]" />
                    <span className="text-sm font-medium text-gray-700">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-blue-50 text-blue-500">
                            <BookOpen size={24} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900">{enrolledCourses.length || 0}</h3>
                        <p className="text-sm text-gray-500 font-medium mt-1">Enrolled Courses</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-orange-50 text-orange-500">
                            <Clock size={24} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900">32h</h3>
                        <p className="text-sm text-gray-500 font-medium mt-1">Hours Learned</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-green-50 text-green-500">
                            <CheckCircle size={24} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900">
                            {assignments ? assignments.filter(a => a.status === 'Graded' || a.status === 'Submitted').length : 0}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium mt-1">Assignments Done</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-purple-50 text-purple-500">
                            <Video size={24} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-gray-900">{liveClasses.length || 0}</h3>
                        <p className="text-sm text-gray-500 font-medium mt-1">Today's Classes</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - Left Column (2/3) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Activity Chart */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900">Learning Activity</h2>
                            <select
                                value={timeframe}
                                onChange={(e) => setTimeframe(e.target.value)}
                                className="bg-gray-50 border-none text-sm font-medium text-gray-600 rounded-lg py-1 px-3 focus:ring-0 outline-none cursor-pointer"
                            >
                                <option value="Weekly">Weekly</option>
                                <option value="Monthly">Monthly</option>
                            </select>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                <BarChart data={currentChartData}>
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        hide={true}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f3f4f6' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="hours" radius={[6, 6, 6, 6]} barSize={32}>
                                        {currentChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.hours > (timeframe === 'Weekly' ? 3 : 15) ? '#8b5cf6' : '#e5e7eb'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Upcoming Classes */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900">Upcoming Live Classes</h2>
                            <button
                                onClick={() => navigate('/student/live')}
                                className="text-[#8b5cf6] text-sm font-bold hover:underline"
                            >
                                See all
                            </button>
                        </div>
                        <div className="space-y-4">
                            {liveClasses.length > 0 ? liveClasses.map((cls) => (
                                <div key={cls.id} className="flex items-center p-4 rounded-xl border border-gray-100 hover:border-purple-100 hover:bg-purple-50/30 transition-colors group">
                                    <div className="w-16 h-16 rounded-xl bg-purple-100 flex flex-col items-center justify-center flex-shrink-0 text-[#8b5cf6]">
                                        <span className="text-xs font-bold uppercase">{cls.time.split(' ')[1]}</span>
                                        <span className="text-lg font-bold">{cls.time.split(' ')[0]}</span>
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h3 className="font-bold text-gray-900 group-hover:text-[#8b5cf6] transition-colors">{cls.title}</h3>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                            <span className="flex items-center gap-1"><User size={14} /> {cls.mentor}</span>
                                            <span className="flex items-center gap-1"><Clock size={14} /> {cls.duration}</span>
                                        </div>
                                    </div>
                                    <a href={cls.link} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-[#8b5cf6] hover:text-white hover:border-[#8b5cf6] transition-all">
                                        <Video size={18} />
                                    </a>
                                </div>
                            )) : (
                                <p className="text-center text-gray-400 py-4">No live classes scheduled.</p>
                            )}
                        </div>
                    </div>

                </div>

                {/* Right Sidebar (1/3) */}
                <div className="space-y-8">

                    {/* Announcements Widget */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900">Announcements</h2>
                            <span className="bg-[#8b5cf6]/10 text-[#8b5cf6] px-2 py-0.5 rounded text-xs font-bold">{announcements.length} New</span>
                        </div>
                        <div className="space-y-5">
                            {announcements.slice(0, 3).map((ann, idx) => (
                                <div key={idx} className="space-y-1">
                                    <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{ann.title}</h4>
                                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{ann.message}</p>
                                    <p className="text-[10px] text-[#8b5cf6] font-medium pt-1 uppercase">{new Date(ann.date).toLocaleDateString()}</p>
                                </div>
                            ))}
                            {announcements.length === 0 && (
                                <p className="text-xs text-gray-400 text-center py-4">No recent announcements.</p>
                            )}
                        </div>
                    </div>

                    {/* Enrolled Courses Snapshot */}
                    <EnrolledCourseSnapshot courses={enrolledCourses} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
