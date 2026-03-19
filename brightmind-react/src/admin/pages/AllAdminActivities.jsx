import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import {
    Activity, ArrowLeft, BookOpen, FileText, Layers, UserPlus,
    Settings, Megaphone, History, Search, Filter, Loader2,
    AlertCircle, RefreshCw, Clock, Globe
} from 'lucide-react';

const MODULE_LABELS = {
    course: 'Course',
    exam: 'Exam',
    batch: 'Batch',
    user: 'User',
    settings: 'Settings',
    announcement: 'Announcement'
};

const ACTION_COLORS = {
    CREATE: 'bg-green-100 text-green-700 border-green-200',
    UPDATE: 'bg-blue-100 text-blue-700 border-blue-200',
    DELETE: 'bg-red-100 text-red-700 border-red-200',
    ASSIGN: 'bg-purple-100 text-purple-700 border-purple-200',
    OTHER:  'bg-gray-100 text-gray-600 border-gray-200'
};

const MODULE_ICONS = {
    course:       <BookOpen size={14} />,
    exam:         <FileText size={14} />,
    batch:        <Layers size={14} />,
    user:         <UserPlus size={14} />,
    settings:     <Settings size={14} />,
    announcement: <Megaphone size={14} />
};

const AllAdminActivities = () => {
    const [logs, setLogs]         = useState([]);
    const [admins, setAdmins]     = useState([]);
    const [total, setTotal]       = useState(0);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);

    // Filters
    const [adminId, setAdminId]   = useState('');
    const [module, setModule]     = useState('');
    const [date, setDate]         = useState('');
    const [page, setPage]         = useState(1);
    const LIMIT = 50;

    const fetchAdmins = async () => {
        try {
            const res = await api.get('/superadmin/admins');
            if (res.data.success) setAdmins(res.data.admins);
        } catch (_) {}
    };

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ page, limit: LIMIT });
            if (adminId) params.append('adminId', adminId);
            if (module)  params.append('module', module);
            if (date)    params.append('date', date);

            const res = await api.get(`/superadmin/activity-logs?${params.toString()}`);
            if (res.data.success) {
                setLogs(res.data.logs);
                setTotal(res.data.total);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load activity logs');
        } finally {
            setLoading(false);
        }
    }, [adminId, module, date, page]);

    useEffect(() => { fetchAdmins(); }, []);
    useEffect(() => { setPage(1); }, [adminId, module, date]);
    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const totalPages = Math.ceil(total / LIMIT);

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/admin/admin-management" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <ArrowLeft size={20} className="text-gray-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                            <Activity size={24} className="text-purple-600" />
                            All Admin Activity Logs
                        </h1>
                        <p className="text-sm text-gray-400 mt-0.5">Complete audit trail of all admin actions</p>
                    </div>
                </div>
                <button
                    onClick={fetchLogs}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                    <RefreshCw size={14} />
                    Refresh
                </button>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Actions', value: total, color: 'text-purple-600' },
                    { label: 'This Page', value: logs.length, color: 'text-blue-600' },
                    { label: 'Admins', value: admins.length, color: 'text-green-600' },
                    { label: 'Page', value: `${page} / ${totalPages || 1}`, color: 'text-gray-600' }
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                        <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Filter size={15} className="text-purple-600" />
                    <h3 className="font-black text-gray-900 text-sm">Filter Logs</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Admin filter */}
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Admin</label>
                        <select
                            value={adminId}
                            onChange={e => setAdminId(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        >
                            <option value="">All Admins</option>
                            {admins.map(a => (
                                <option key={a.id} value={a.id}>{a.name} ({a.role})</option>
                            ))}
                        </select>
                    </div>

                    {/* Module filter */}
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Module</label>
                        <select
                            value={module}
                            onChange={e => setModule(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        >
                            <option value="">All Modules</option>
                            {Object.entries(MODULE_LABELS).map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date filter */}
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        />
                    </div>
                </div>

                {(adminId || module || date) && (
                    <button
                        onClick={() => { setAdminId(''); setModule(''); setDate(''); }}
                        className="mt-3 text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-black text-gray-900 flex items-center gap-2 text-sm">
                        <History size={16} className="text-purple-600" />
                        Activity Log
                        {total > 0 && <span className="ml-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-black">{total}</span>}
                    </h3>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-purple-600" size={36} />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center py-16 text-center px-6">
                        <AlertCircle size={40} className="text-red-400 mb-3" />
                        <p className="text-gray-600 font-bold">{error}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/70">
                                <tr>
                                    {['Admin', 'Module', 'Action', 'Description', 'IP Address', 'Date'].map(h => (
                                        <th key={h} className="py-3.5 px-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="p-4 bg-gray-50 rounded-full mb-3 text-gray-300">
                                                    <History size={32} />
                                                </div>
                                                <p className="text-gray-400 font-bold italic">No activity logs found</p>
                                                <p className="text-gray-300 text-xs mt-1">Try adjusting your filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : logs.map(log => (
                                    <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                                        {/* Admin */}
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-xs font-black shrink-0">
                                                    {log.admin?.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 leading-none">{log.admin?.name || 'Unknown'}</p>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">{log.admin?.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Module */}
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-1.5 text-gray-600">
                                                <span className="text-gray-400">{MODULE_ICONS[log.moduleName] || <Globe size={14} />}</span>
                                                <span className="text-xs font-bold capitalize">{MODULE_LABELS[log.moduleName] || log.moduleName || '—'}</span>
                                            </div>
                                        </td>
                                        {/* Action */}
                                        <td className="py-4 px-5">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${ACTION_COLORS[log.actionType] || ACTION_COLORS.OTHER}`}>
                                                {log.actionType}
                                            </span>
                                        </td>
                                        {/* Description */}
                                        <td className="py-4 px-5 max-w-xs">
                                            <p className="text-sm text-gray-700 font-medium truncate">{log.description || log.actionDescription || '—'}</p>
                                        </td>
                                        {/* IP */}
                                        <td className="py-4 px-5">
                                            <span className="text-xs text-gray-400 font-mono">{log.ipAddress || '—'}</span>
                                        </td>
                                        {/* Date */}
                                        <td className="py-4 px-5">
                                            <div className="flex flex-col">
                                                <p className="text-sm font-bold text-gray-900">
                                                    {new Date(log.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                                <div className="flex items-center gap-1 text-gray-400 text-[10px] font-bold mt-0.5">
                                                    <Clock size={9} />
                                                    {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-5 border-t border-gray-50 flex items-center justify-between">
                        <p className="text-xs text-gray-400 font-bold">
                            Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                            >
                                Previous
                            </button>
                            <span className="text-xs font-black text-gray-500 px-2">{page} / {totalPages}</span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllAdminActivities;
