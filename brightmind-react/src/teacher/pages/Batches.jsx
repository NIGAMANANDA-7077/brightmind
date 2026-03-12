import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Users, BookOpen, Calendar, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import api from '../../utils/axiosConfig';

const statusColors = {
    active: 'bg-green-100 text-green-700',
    upcoming: 'bg-blue-100 text-blue-700',
    completed: 'bg-gray-100 text-gray-600'
};

const TeacherBatches = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBatches = async () => {
            try {
                const res = await api.get('/batches/teacher/my-batches');
                setBatches(res.data.data || []);
            } catch (e) {
                setError(e.response?.data?.message || e.message || 'Failed to load batches');
            } finally {
                setLoading(false);
            }
        };
        fetchBatches();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">My Batches</h1>
                <p className="text-sm text-gray-500 mt-1">All batches assigned to you</p>
            </div>

            {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl">
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="animate-spin text-[#8b5cf6]" size={40} />
                </div>
            ) : batches.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
                    <Layers size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No batches assigned yet</p>
                    <p className="text-sm text-gray-400 mt-1">Ask your admin to assign a batch to you</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {batches.map(batch => (
                        <div
                            key={batch.id}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 cursor-pointer group"
                            onClick={() => navigate(`/teacher/batches/${batch.id}`)}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[batch.batchStatus] || 'bg-gray-100 text-gray-500'}`}>
                                    {batch.batchStatus}
                                </span>
                                <ChevronRight size={18} className="text-gray-300 group-hover:text-[#8b5cf6] transition-colors" />
                            </div>

                            <h3 className="text-lg font-bold text-gray-800 mb-1 leading-tight">{batch.batchName}</h3>

                            <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-3">
                                <BookOpen size={14} className="text-purple-400" />
                                <span className="truncate">{batch.course?.title || 'No course assigned'}</span>
                            </div>

                            <div className="flex items-center gap-4 pt-3 border-t border-gray-50">
                                <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                                    <Users size={14} className="text-blue-400" />
                                    <span>{batch.studentCount ?? 0} Students</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                                    <Calendar size={14} className="text-green-400" />
                                    <span>{batch.startDate ? new Date(batch.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '—'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TeacherBatches;
