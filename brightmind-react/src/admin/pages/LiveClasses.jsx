import React, { useState, useEffect } from 'react';
import { Video, Calendar, Clock, Search, Loader2 } from 'lucide-react';
import api from '../../utils/axiosConfig';

const AdminLiveClasses = () => {
    const [liveClasses, setLiveClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [fetchError, setFetchError] = useState('');

    const fetchAllLiveClasses = async () => {
        setLoading(true);
        setFetchError('');
        try {
            const res = await api.get('/live-classes/admin/all');
            setLiveClasses(res.data.liveClasses || []);
        } catch (err) {
            console.error("Failed to fetch admin live classes:", err);
            setLiveClasses([]);
            setFetchError(err.response?.data?.message || 'Failed to load live classes.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllLiveClasses();
    }, []);

    const filtered = liveClasses.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.course?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.teacher?.name && c.teacher.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#8b5cf6]" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Live Classes Management</h1>
                    <p className="text-gray-500 mt-1">Monitor all scheduled and live sessions across the platform</p>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by title, course, or teacher..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#8b5cf6]/30 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Classes Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {fetchError && (
                    <div className="px-6 py-4 bg-red-50 border-b border-red-100 text-red-600 text-sm font-medium">
                        {fetchError}
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Session & Course</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Instructor</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Schedule</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                        No live classes found
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-bold text-gray-900">{c.title}</span>
                                                <span className="text-xs text-gray-500">{c.course?.title}</span>
                                                {c.batch && (
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-100 self-start uppercase tracking-widest">
                                                        Batch: {c.batch.batchName}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center text-[10px] font-bold text-[#8b5cf6]">
                                                    {(c.teacher?.name || 'T').charAt(0)}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">{c.teacher?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-xs text-gray-500 gap-1">
                                                <span className="flex items-center gap-1"><Calendar size={12} /> {c.classDate}</span>
                                                <span className="flex items-center gap-1"><Clock size={12} /> {c.startTime} ({c.duration})</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${c.status === 'Live' ? 'bg-red-100 text-red-600' :
                                                c.status === 'Upcoming' ? 'bg-blue-100 text-blue-600' :
                                                    'bg-green-100 text-green-600'
                                                }`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <a
                                                href={c.meetingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[#8b5cf6] hover:bg-[#8b5cf6]/10 p-2 rounded-lg transition-colors inline-block"
                                                title="View Link"
                                            >
                                                <Video size={18} />
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminLiveClasses;
