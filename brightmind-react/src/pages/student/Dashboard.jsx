import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, Play, Calendar, User, BookOpen, CheckCircle, Video, Layers } from 'lucide-react';
import { notifications } from '../../data/studentData';
import { useCourse } from '../../context/CourseContext';
import { useAssignment } from '../../context/AssignmentContext';
import { useUser } from '../../context/UserContext';
import { useBatch } from '../../context/BatchContext';
import EnrolledCourseSnapshot from '../../components/student/EnrolledCourseSnapshot';
import { useNavigate } from 'react-router-dom';

import { useSharedAnnouncements } from '../../context/SharedAnnouncementsContext';
import { useNotifications } from '../../hooks/useNotifications';
import AnnouncementDetailModal from '../../components/student/modals/AnnouncementDetailModal';
import api from '../../utils/axiosConfig';

const Dashboard = () => {
    const { user } = useUser();
    const { courses: enrolledCourses } = useCourse();
    const { assignments } = useAssignment();
    const { announcements } = useSharedAnnouncements();
    const { markAsReadByReference } = useNotifications();
    const { myBatch, myBatches, myLiveClasses } = useBatch();
    const [timeframe, setTimeframe] = React.useState('Weekly');
    const [selectedAnn, setSelectedAnn] = React.useState(null);
    const [showAnnModal, setShowAnnModal] = React.useState(false);
    const [activityData, setActivityData] = React.useState({ weekly: null, monthly: null });
    const navigate = useNavigate();

    const safeUser = user || {};
    const safeCourses = Array.isArray(enrolledCourses) ? enrolledCourses : [];
    const safeAssignments = Array.isArray(assignments) ? assignments : [];

    // Track read announcement IDs in localStorage per user
    const [readAnnIds, setReadAnnIds] = React.useState(new Set());

    React.useEffect(() => {
        if (!safeUser.id) return;
        const key = `read_anns_${safeUser.id}`;
        try { setReadAnnIds(new Set(JSON.parse(localStorage.getItem(key) || '[]'))); }
        catch { setReadAnnIds(new Set()); }
    }, [safeUser.id]);

    // Only show unread announcements in the widget
    const safeAnnouncements = React.useMemo(() =>
        (Array.isArray(announcements) ? announcements : []).filter(a => !readAnnIds.has(a.id)),
        [announcements, readAnnIds]
    );

    const firstName = safeUser.name ? safeUser.name.split(' ')[0] : 'Student';

    const handleAnnouncementConfirm = () => {
        if (selectedAnn?.id) {
            const updated = new Set(readAnnIds);
            updated.add(selectedAnn.id);
            setReadAnnIds(updated);
            if (safeUser.id) {
                try { localStorage.setItem(`read_anns_${safeUser.id}`, JSON.stringify([...updated])); } catch (_) {}
            }
            // Also mark notification as read in backend (best-effort)
            markAsReadByReference(selectedAnn.id).catch(() => {});
        }
        setShowAnnModal(false);
    };

    React.useEffect(() => {
        api.get('/student/activity')
            .then(res => setActivityData({ weekly: res.data.weekly, monthly: res.data.monthly }))
            .catch(() => {});
    }, []);

    // Use live classes from BatchContext (already filtered for student's batch)
    const today = new Date().toISOString().split('T')[0];
    const upcomingClasses = myLiveClasses.filter(cls => cls.classDate >= today && cls.status !== 'Completed');
    const todaysClassesCount = myLiveClasses.filter(cls => cls.classDate === today).length;

    const defaultWeekly = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(n => ({ name: n, lessons: 0 }));
    const defaultMonthly = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map(n => ({ name: n, lessons: 0 }));

    const currentChartData = timeframe === 'Weekly'
        ? (activityData.weekly || defaultWeekly)
        : (activityData.monthly || defaultMonthly);

    return (
        <div className="space-y-8">
            {/* Header / Welcome */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Hello, <span className="text-[#8b5cf6]">{firstName}!</span> 👋
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
                        <h3 className="text-3xl font-bold text-gray-900">{safeCourses.length}</h3>
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
                        <h3 className="text-3xl font-bold text-gray-900">{safeUser.totalHoursLearned || 0}h</h3>
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
                            {safeAssignments.filter(a => a.status === 'Graded' || a.status === 'Submitted').length}
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
                        <h3 className="text-3xl font-bold text-gray-900">{todaysClassesCount}</h3>
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
                                        formatter={(value) => [`${value} lessons`, 'Lessons Completed']}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="lessons" radius={[6, 6, 6, 6]} barSize={32}>
                                        {currentChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.lessons > 0 ? '#8b5cf6' : '#e5e7eb'} />
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
                            {upcomingClasses.length > 0 ? upcomingClasses.slice(0, 3).map((cls) => (
                                <div key={cls.id} className="flex items-center p-4 rounded-xl border border-gray-100 hover:border-purple-100 hover:bg-purple-50/30 transition-colors group">
                                    <div className="w-16 h-16 rounded-xl bg-purple-100 flex flex-col items-center justify-center flex-shrink-0 text-[#8b5cf6]">
                                        <span className="text-xs font-bold">{cls.classDate?.slice(5)}</span>
                                        <span className="text-xs font-bold">{cls.startTime}</span>
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h3 className="font-bold text-gray-900 group-hover:text-[#8b5cf6] transition-colors">{cls.title}</h3>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                            <span className="flex items-center gap-1"><User size={14} /> {cls.teacher?.name || 'Teacher'}</span>
                                            <span className="flex items-center gap-1"><Clock size={14} /> {cls.duration} min</span>
                                        </div>
                                    </div>
                                    <a href={cls.meetingLink} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-[#8b5cf6] hover:text-white hover:border-[#8b5cf6] transition-all">
                                        <Video size={18} />
                                    </a>
                                </div>
                            )) : (
                                <p className="text-center text-gray-400 py-4">No upcoming live classes in your batch.</p>
                            )}
                        </div>
                    </div>

                </div>

                {/* Right Sidebar (1/3) */}
                <div className="space-y-8">

                    {/* My Batches Card */}
                    {myBatches && myBatches.length > 0 ? (
                        <div className="space-y-3">
                            {myBatches.map((batch, idx) => (
                                <div key={batch.id || idx} className="bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white p-6 rounded-2xl shadow-lg">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-white/20 rounded-xl">
                                            <Layers size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-white/70">My Batch</p>
                                            <h3 className="font-bold text-lg leading-tight">{batch.batchName}</h3>
                                        </div>
                                    </div>
                                    {batch.course && (
                                        <p className="text-sm text-white/80 mb-3 flex items-center gap-1">
                                            <BookOpen size={13} /> {batch.course.title}
                                        </p>
                                    )}
                                    {batch.teacher && (
                                        <p className="text-sm text-white/80 flex items-center gap-1">
                                            <User size={13} /> {batch.teacher.name}
                                        </p>
                                    )}
                                    {(batch.startDate || batch.endDate) && (
                                        <p className="text-xs text-white/60 mt-3 flex items-center gap-1">
                                            <Calendar size={11} /> {batch.startDate} → {batch.endDate || 'Ongoing'}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-50 border border-dashed border-gray-200 p-6 rounded-2xl text-center">
                            <Layers size={28} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-sm text-gray-400 font-medium">No batch assigned yet</p>
                            <p className="text-xs text-gray-400 mt-1">Contact admin to get assigned to a batch</p>
                        </div>
                    )}

                    {/* Announcements Widget */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-gray-900">Announcements</h2>
                            <span className="bg-[#8b5cf6]/10 text-[#8b5cf6] px-2 py-0.5 rounded text-xs font-bold">{safeAnnouncements.length} New</span>
                        </div>
                        <div className="space-y-5">
                            {safeAnnouncements.slice(0, 3).map((ann, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => { setSelectedAnn(ann); setShowAnnModal(true); }}
                                    className="space-y-1 cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded-xl transition-colors group"
                                >
                                    <h4 className="font-bold text-sm text-gray-900 line-clamp-1 group-hover:text-[#8b5cf6]">{ann.title}</h4>
                                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{ann.message}</p>
                                    <p className="text-[10px] text-[#8b5cf6] font-medium pt-1 uppercase">{new Date(ann.date).toLocaleDateString()}</p>
                                </div>
                            ))}
                            {safeAnnouncements.length === 0 && (
                                <p className="text-xs text-gray-400 text-center py-4">No recent announcements.</p>
                            )}
                        </div>
                    </div>

                    {/* Enrolled Courses Snapshot */}
                    <EnrolledCourseSnapshot courses={safeCourses} />
                </div>
            </div>

            <AnnouncementDetailModal
                isOpen={showAnnModal}
                onClose={() => setShowAnnModal(false)}
                onConfirm={handleAnnouncementConfirm}
                announcement={selectedAnn}
            />
        </div>
    );
};

export default Dashboard;
