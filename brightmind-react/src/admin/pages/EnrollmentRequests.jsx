import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, CheckCircle, XCircle, Clock, Loader2, RefreshCw, BookOpen, User } from 'lucide-react';
import api from '../../utils/axiosConfig';

const statusBadge = (status) => {
    if (status === 'pending') return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-600 border border-yellow-200">⏳ Pending</span>;
    if (status === 'approved') return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-200">✅ Approved</span>;
    if (status === 'rejected') return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">❌ Rejected</span>;
    return null;
};

const EnrollmentRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [processing, setProcessing] = useState(null);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/enrollment-requests');
            setRequests(res.data.requests || []);
        } catch (err) {
            console.error('Failed to fetch enrollment requests:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleApprove = async (id) => {
        setProcessing(id + '_approve');
        try {
            await api.put(`/enrollment-requests/${id}/approve`);
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to approve');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (id) => {
        setProcessing(id + '_reject');
        try {
            await api.put(`/enrollment-requests/${id}/reject`);
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to reject');
        } finally {
            setProcessing(null);
        }
    };

    const filters = [
        { key: 'pending', label: 'Pending', icon: Clock },
        { key: 'approved', label: 'Approved', icon: CheckCircle },
        { key: 'rejected', label: 'Rejected', icon: XCircle },
        { key: 'all', label: 'All', icon: ClipboardList },
    ];

    const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

    const counts = {
        pending: requests.filter(r => r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        rejected: requests.filter(r => r.status === 'rejected').length,
        all: requests.length
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Enrollment Requests</h1>
                    <p className="text-gray-500 mt-1">Review and manage student course enrollment requests</p>
                </div>
                <button
                    onClick={fetchRequests}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Pending', value: counts.pending, color: 'yellow', icon: Clock },
                    { label: 'Approved', value: counts.approved, color: 'green', icon: CheckCircle },
                    { label: 'Rejected', value: counts.rejected, color: 'red', icon: XCircle },
                    { label: 'Total', value: counts.all, color: 'purple', icon: ClipboardList },
                ].map(({ label, value, color, icon: Icon }) => (
                    <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <div className={`w-10 h-10 rounded-xl bg-${color}-50 flex items-center justify-center mb-3`}>
                            <Icon size={20} className={`text-${color}-500`} />
                        </div>
                        <p className="text-2xl font-black text-gray-900">{value}</p>
                        <p className="text-sm text-gray-500 font-medium">{label}</p>
                    </div>
                ))}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {filters.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                            filter === key
                                ? 'bg-[#8b5cf6] text-white shadow-lg shadow-purple-500/20'
                                : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
                        }`}
                    >
                        <Icon size={15} />
                        {label}
                        {counts[key] > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>{counts[key]}</span>}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-[#8b5cf6]" size={32} />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <ClipboardList size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-400 font-medium">No {filter === 'all' ? '' : filter} requests found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Student</th>
                                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Course</th>
                                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Date</th>
                                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Status</th>
                                    <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((request) => (
                                    <tr key={request.id} className="hover:bg-gray-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-[#8b5cf6] font-bold text-sm">
                                                    {request.studentName?.charAt(0)?.toUpperCase() || 'S'}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm">{request.studentName}</p>
                                                    <p className="text-xs text-gray-400">{request.studentEmail}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {request.courseThumbnail ? (
                                                    <img src={request.courseThumbnail} alt="" className="w-10 h-8 rounded-lg object-cover" />
                                                ) : (
                                                    <div className="w-10 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                                        <BookOpen size={14} className="text-gray-400" />
                                                    </div>
                                                )}
                                                <span className="font-medium text-gray-900 text-sm line-clamp-1">{request.courseTitle}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(request.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            {statusBadge(request.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {request.status === 'pending' ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleApprove(request.id)}
                                                        disabled={processing === request.id + '_approve'}
                                                        className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-all disabled:opacity-50"
                                                    >
                                                        {processing === request.id + '_approve' ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={14} />}
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(request.id)}
                                                        disabled={processing === request.id + '_reject'}
                                                        className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-all disabled:opacity-50"
                                                    >
                                                        {processing === request.id + '_reject' ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={14} />}
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">
                                                    {request.status === 'approved' ? 'Enrolled ✅' : 'Dismissed ❌'}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnrollmentRequests;
