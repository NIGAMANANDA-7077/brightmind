import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Users, BookOpen, Calendar, ChevronRight, Loader2, Layers, AlertCircle } from 'lucide-react';
import api from '../../utils/axiosConfig';

const statusColors = {
    active: 'bg-green-100 text-green-700',
    upcoming: 'bg-blue-100 text-blue-700',
    completed: 'bg-gray-100 text-gray-600'
};

const Batches = () => {
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({ total: 0, active: 0, upcoming: 0 });
    const [deleteId, setDeleteId] = useState(null);
    const navigate = useNavigate();

    const fetchBatches = async () => {
        try {
            setLoading(true);
            const res = await api.get('/batches');
            const data = res.data.data || [];
            setBatches(data);
            setStats({
                total: data.length,
                active: data.filter(b => b.batchStatus === 'active').length,
                upcoming: data.filter(b => b.batchStatus === 'upcoming').length
            });
        } catch (e) {
            setError(e.response?.data?.message || e.message || 'Failed to load batches');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBatches(); }, []);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/batches/${deleteId}`);
            setDeleteId(null);
            fetchBatches();
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to delete batch');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Batches</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage student batches across courses and teachers</p>
                </div>
                <button
                    onClick={() => navigate('/admin/batches/create')}
                    className="flex items-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
                >
                    <Plus size={18} /> Create Batch
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Batches', value: stats.total, color: 'text-purple-600 bg-purple-50', icon: Layers },
                    { label: 'Active', value: stats.active, color: 'text-green-600 bg-green-50', icon: Users },
                    { label: 'Upcoming', value: stats.upcoming, color: 'text-blue-600 bg-blue-50', icon: Calendar }
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${s.color}`}><s.icon size={22} /></div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Batch Table */}
            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="animate-spin text-[#8b5cf6]" size={40} />
                </div>
            ) : batches.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
                    <Layers size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">No batches created yet</p>
                    <p className="text-sm text-gray-400 mt-1">Click "Create Batch" to get started</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Batch</th>
                                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Course</th>
                                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Teacher</th>
                                <th className="text-center px-5 py-3.5 font-semibold text-gray-600">Students</th>
                                <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Status</th>
                                <th className="text-right px-5 py-3.5 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {batches.map(batch => (
                                <tr key={batch.id} className="hover:bg-gray-50/60 transition-colors">
                                    <td className="px-5 py-4">
                                        <p className="font-semibold text-gray-800">{batch.batchName}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {batch.startDate ? `${batch.startDate} → ${batch.endDate || 'Ongoing'}` : 'No dates set'}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4 text-gray-600">{batch.course?.title || '—'}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            {batch.teacher?.avatar && <img src={batch.teacher.avatar} alt="" className="w-6 h-6 rounded-full" />}
                                            <span className="text-gray-700">{batch.teacher?.name || '—'}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-center font-medium text-gray-700">{batch.studentCount || 0}</td>
                                    <td className="px-5 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[batch.batchStatus] || 'bg-gray-100 text-gray-500'}`}>
                                            {batch.batchStatus}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => navigate(`/admin/batches/edit/${batch.id}`)} className="p-2 hover:bg-purple-50 rounded-lg text-gray-400 hover:text-[#8b5cf6]">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => setDeleteId(batch.id)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <h3 className="text-lg font-bold text-gray-800">Delete Batch?</h3>
                        <p className="text-sm text-gray-500 mt-2">This will remove the batch and clear all student assignments. This action cannot be undone.</p>
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Batches;
