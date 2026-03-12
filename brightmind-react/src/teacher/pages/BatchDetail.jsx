import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Video, BookOpen, Loader2, AlertCircle, Calendar, Clock, ExternalLink } from 'lucide-react';
import api from '../../utils/axiosConfig';

const statusColors = {
    Upcoming: 'bg-blue-100 text-blue-700',
    Live: 'bg-green-100 text-green-700',
    Completed: 'bg-gray-100 text-gray-600'
};

const tabs = ['Students', 'Live Classes', 'Modules'];

const TeacherBatchDetail = () => {
    const { batchId } = useParams();
    const navigate = useNavigate();

    const [batch, setBatch] = useState(null);
    const [liveClasses, setLiveClasses] = useState([]);
    const [modules, setModules] = useState([]);
    const [activeTab, setActiveTab] = useState('Students');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const bRes = await api.get(`/batches/${batchId}`);
                const bData = bRes.data;
                if (!bData.success) throw new Error(bData.message || 'Failed to load batch');
                setBatch(bData.data);

                if (bData.data?.courseId) {
                    try {
                        const lcRes = await api.get(`/live-classes/course/${bData.data.courseId}`);
                        const all = lcRes.data.liveClasses || [];
                        setLiveClasses(all.filter(lc => lc.batchId === batchId || !lc.batchId));
                    } catch (e) {
                        console.warn('Could not fetch live classes:', e.message);
                    }

                    try {
                        const mRes = await api.get(`/modules?courseId=${bData.data.courseId}`);
                        const mData = mRes.data;
                        setModules(Array.isArray(mData) ? mData : (mData.modules || mData.data || []));
                    } catch (e) {
                        console.warn('Could not fetch modules:', e.message);
                    }
                }
            } catch (e) {
                setError(e.response?.data?.message || e.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [batchId]);

    if (loading) return (
        <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-[#8b5cf6]" size={40} />
        </div>
    );

    if (error) return (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl">
            <AlertCircle size={20} /> {error}
        </div>
    );

    const students = batch?.students || [];

    return (
        <div className="space-y-6">
            <div className="flex items-start gap-4">
                <button onClick={() => navigate('/teacher/batches')} className="p-2 hover:bg-gray-100 rounded-lg mt-1">
                    <ArrowLeft size={20} className="text-gray-500" />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl font-bold text-gray-800">{batch?.batchName}</h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${batch?.batchStatus === 'active' ? 'bg-green-100 text-green-700' : batch?.batchStatus === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                            {batch?.batchStatus}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                        <BookOpen size={14} className="text-purple-400" />
                        {batch?.course?.title}
                        {batch?.startDate && (
                            <span className="ml-2 text-gray-400">· {batch.startDate} → {batch.endDate || 'Ongoing'}</span>
                        )}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[
                    { icon: Users, label: 'Students', value: students.length, color: 'text-blue-500 bg-blue-50' },
                    { icon: Video, label: 'Live Classes', value: liveClasses.length, color: 'text-green-500 bg-green-50' },
                    { icon: BookOpen, label: 'Modules', value: modules.length, color: 'text-purple-500 bg-purple-50' }
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${s.color}`}><s.icon size={20} /></div>
                        <div>
                            <p className="text-xl font-bold text-gray-800">{s.value}</p>
                            <p className="text-xs text-gray-500">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-100">
                    {tabs.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === tab ? 'text-[#8b5cf6] border-b-2 border-[#8b5cf6]' : 'text-gray-500 hover:text-gray-700'}`}>
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="p-5">
                    {activeTab === 'Students' && (
                        students.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <Users size={36} className="mx-auto mb-2 opacity-50" />
                                <p>No students in this batch yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 rounded-xl">
                                            <th className="text-left px-4 py-3 font-semibold text-gray-600">Student</th>
                                            <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {students.map(s => (
                                            <tr key={s.id} className="hover:bg-gray-50/60">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                            {s.name?.charAt(0)?.toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-gray-800">{s.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500">{s.email}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}

                    {activeTab === 'Live Classes' && (
                        liveClasses.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <Video size={36} className="mx-auto mb-2 opacity-50" />
                                <p>No live classes scheduled for this batch</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {liveClasses.map(lc => (
                                    <div key={lc.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-4">
                                        <div>
                                            <p className="font-semibold text-gray-800">{lc.title}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                                <span className="flex items-center gap-1"><Calendar size={12} /> {lc.classDate}</span>
                                                <span className="flex items-center gap-1"><Clock size={12} /> {lc.startTime}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[lc.status] || 'bg-gray-100 text-gray-500'}`}>
                                                {lc.status}
                                            </span>
                                            {lc.meetingLink && (
                                                <a href={lc.meetingLink} target="_blank" rel="noopener noreferrer"
                                                    className="p-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors">
                                                    <ExternalLink size={16} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {activeTab === 'Modules' && (
                        modules.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <BookOpen size={36} className="mx-auto mb-2 opacity-50" />
                                <p>No modules available for this course</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {modules.map((mod, idx) => (
                                    <div key={mod.id || idx} className="flex items-center gap-4 bg-gray-50 rounded-xl px-5 py-3.5">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{mod.title || mod.name}</p>
                                            {mod.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{mod.description}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherBatchDetail;
