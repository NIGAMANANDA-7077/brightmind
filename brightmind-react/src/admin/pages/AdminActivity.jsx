import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import { 
    ShieldCheck, ArrowLeft, History, Clock, 
    FileText, UserPlus, Layers, Video, Settings, Trash2, 
    RefreshCw, BookOpen, Megaphone, Loader2, AlertCircle, Globe
} from 'lucide-react';

const MODULE_LABELS = {
    course: 'Course', exam: 'Exam', batch: 'Batch',
    user: 'User', settings: 'Settings', announcement: 'Announcement'
};

const AdminActivity = () => {
    const { id } = useParams();
    const [admin, setAdmin] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchActivity = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/superadmin/admins/${id}/activity`);
            if (res.data.success) {
                setAdmin(res.data.admin);
                setLogs(res.data.logs);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load activity logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchActivity(); }, [id]);

    const getActionIcon = (type, moduleName) => {
        const mod = moduleName || '';
        if (mod === 'course')       return <BookOpen size={14} />;
        if (mod === 'exam')         return <FileText size={14} />;
        if (mod === 'batch')        return <Layers size={14} />;
        if (mod === 'user')         return <UserPlus size={14} />;
        if (mod === 'announcement') return <Megaphone size={14} />;
        if (mod === 'settings')     return <Settings size={14} />;
        // Fallback for legacy combined actionType values
        if (type?.includes('COURSE'))       return <BookOpen size={14} />;
        if (type?.includes('EXAM'))         return <FileText size={14} />;
        if (type?.includes('BATCH'))        return <Layers size={14} />;
        if (type?.includes('USER'))         return <UserPlus size={14} />;
        if (type?.includes('ANNOUNCEMENT')) return <Megaphone size={14} />;
        if (type?.includes('SETTINGS'))     return <Settings size={14} />;
        return <History size={14} />;
    };

    const getActionColor = (type) => {
        const t = type || '';
        if (t === 'CREATE' || t.startsWith('CREATE')) return 'bg-green-100 text-green-600 border-green-200';
        if (t === 'UPDATE' || t.startsWith('UPDATE')) return 'bg-blue-100 text-blue-600 border-blue-200';
        if (t === 'DELETE' || t.startsWith('DELETE')) return 'bg-red-100 text-red-600 border-red-200';
        if (t === 'ASSIGN' || t.startsWith('ASSIGN')) return 'bg-purple-100 text-purple-600 border-purple-200';
        return 'bg-gray-100 text-gray-600 border-gray-200';
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-purple-600" size={40} />
        </div>
    );

    if (error) return (
        <div className="max-w-4xl mx-auto p-8 bg-red-50 border border-red-200 rounded-3xl flex flex-col items-center text-center">
            <AlertCircle size={48} className="text-red-500 mb-4" />
            <h2 className="text-xl font-black text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link to="/admin/admin-management" className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl transition-transform hover:scale-105">
                Back to Management
            </Link>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/admin/admin-management" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                        <ArrowLeft size={20} className="text-gray-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                            Admin Activity
                        </h1>
                        <p className="text-sm text-gray-400">Monitoring logs for {admin?.name}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-200">
                        {admin?.name?.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-black text-gray-900 leading-none">{admin?.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{admin?.role}</p>
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Total Actions</p>
                    <p className="text-2xl font-black text-gray-900">{logs.length}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Status</p>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${admin?.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {admin?.status}
                    </span>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Account Created</p>
                    <p className="text-sm font-bold text-gray-600">{new Date(admin?.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Activity Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-black text-gray-900 flex items-center gap-2">
                        <History size={18} className="text-purple-600" />
                        Activity History
                    </h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="py-4 px-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Module</th>
                                <th className="py-4 px-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                                <th className="py-4 px-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                                <th className="py-4 px-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">IP Address</th>
                                <th className="py-4 px-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="p-4 bg-gray-50 rounded-full mb-3 text-gray-300">
                                                <History size={32} />
                                            </div>
                                            <p className="text-gray-400 font-bold italic">No activity recorded yet</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                        {/* Module */}
                                        <td className="py-5 px-6">
                                            <div className="flex items-center gap-1.5 text-gray-500">
                                                {getActionIcon(log.actionType, log.moduleName)}
                                                <span className="text-xs font-bold capitalize">
                                                    {MODULE_LABELS[log.moduleName] || log.moduleName || '—'}
                                                </span>
                                            </div>
                                        </td>
                                        {/* Action */}
                                        <td className="py-5 px-6">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black ${getActionColor(log.actionType)}`}>
                                                {log.actionType}
                                            </div>
                                        </td>
                                        {/* Description */}
                                        <td className="py-5 px-6">
                                            <p className="text-sm font-bold text-gray-700">{log.description || log.actionDescription}</p>
                                        </td>
                                        {/* IP */}
                                        <td className="py-5 px-6">
                                            <span className="text-xs text-gray-400 font-mono">{log.ipAddress || '—'}</span>
                                        </td>
                                        {/* Timestamp */}
                                        <td className="py-5 px-6">
                                            <div className="flex flex-col">
                                                <p className="text-sm font-bold text-gray-900">
                                                    {new Date(log.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                                <div className="flex items-center gap-1 text-gray-400 text-[10px] font-bold">
                                                    <Clock size={10} />
                                                    {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
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

export default AdminActivity;
