import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';
import {
    ShieldCheck, UserPlus, Trash2, RefreshCw, Ban, CheckCircle,
    Loader2, X, Check, Eye, EyeOff, AlertTriangle, LayoutDashboard, Activity
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useNavigate, Link } from 'react-router-dom';

// ── Toast ──────────────────────────────────────────────────────────────────────
const Toast = ({ toast }) => {
    if (!toast) return null;
    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold transition-all
            ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {toast.type === 'success' ? <Check size={16} /> : <X size={16} />}
            {toast.message}
        </div>
    );
};

// ── Add Admin Modal ────────────────────────────────────────────────────────────
const AddAdminModal = ({ onClose, onSuccess }) => {
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Admin', status: 'Active' });
    const [loading, setLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/superadmin/create-admin', form);
            onSuccess('Admin created successfully!');
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create admin');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fadeIn">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-xl">
                            <UserPlus size={20} className="text-purple-600" />
                        </div>
                        <h2 className="text-lg font-black text-gray-900">Add New Admin</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={18} className="text-gray-400" />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                        <AlertTriangle size={16} className="text-red-500 shrink-0" />
                        <p className="text-sm text-red-600 font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {[
                        { label: 'Full Name', name: 'name', type: 'text', placeholder: 'John Doe' },
                        { label: 'Email Address', name: 'email', type: 'email', placeholder: 'admin@brightmind.com' },
                    ].map(f => (
                        <div key={f.name}>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{f.label}</label>
                            <input
                                type={f.type}
                                placeholder={f.placeholder}
                                value={form[f.name]}
                                onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                            />
                        </div>
                    ))}

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                        <div className="relative">
                            <input
                                type={showPw ? 'text' : 'password'}
                                placeholder="Min. 6 characters"
                                value={form.password}
                                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                required
                                minLength={6}
                                className="w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                            />
                            <button type="button" onClick={() => setShowPw(!showPw)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Role</label>
                        <select
                            value={form.role}
                            onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        >
                            <option value="Admin">Admin</option>
                            <option value="SuperAdmin">Super Admin</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                        <select
                            value={form.status}
                            onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        >
                            <option value="Active">Active</option>
                            <option value="Suspended">Suspended</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-[#8b5cf6] text-white font-bold text-sm hover:bg-[#7c3aed] transition-colors shadow disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? <><Loader2 size={14} className="animate-spin" />Creating…</> : 'Create Admin'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── Reset Password Modal ───────────────────────────────────────────────────────
const ResetPasswordModal = ({ admin, onClose, onSuccess }) => {
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.patch(`/superadmin/admins/${admin.id}/reset-password`, { new_password: password });
            onSuccess('Password reset successfully!');
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fadeIn">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-xl">
                            <RefreshCw size={18} className="text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-gray-900">Reset Password</h2>
                            <p className="text-xs text-gray-500 mt-0.5">{admin.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} className="text-gray-400" /></button>
                </div>

                {error && <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">New Password</label>
                        <div className="relative">
                            <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                                required minLength={6} placeholder="Min. 6 characters"
                                className="w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" />
                            <button type="button" onClick={() => setShowPw(!showPw)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors shadow disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? <><Loader2 size={14} className="animate-spin" />Resetting…</> : 'Reset Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const AdminManagement = () => {
    const { impersonate } = useUser();
    const navigate = useNavigate();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [resetTarget, setResetTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const res = await api.get('/superadmin/admins');
            if (res.data.success) setAdmins(res.data.admins);
        } catch (err) {
            showToast('Failed to load admins', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAdmins(); }, []);

    const handleToggleStatus = async (admin) => {
        const newStatus = admin.status === 'Active' ? 'Suspended' : 'Active';
        try {
            await api.patch(`/superadmin/admins/${admin.id}/status`, { status: newStatus });
            showToast(`Admin ${newStatus === 'Active' ? 'activated' : 'suspended'} successfully`);
            setAdmins(prev => prev.map(a => a.id === admin.id ? { ...a, status: newStatus } : a));
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to update status', 'error');
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await api.delete(`/superadmin/admins/${deleteTarget.id}`);
            showToast('Admin deleted successfully');
            setAdmins(prev => prev.filter(a => a.id !== deleteTarget.id));
            setDeleteTarget(null);
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to delete admin', 'error');
        } finally {
            setDeleting(false);
        }
    };

    const handleImpersonate = async (admin) => {
        try {
            const res = await impersonate(admin.id);
            if (res.success) {
                showToast(`Now viewing as ${admin.name}`);
                navigate('/admin/dashboard');
            } else {
                showToast(res.message, 'error');
            }
        } catch (err) {
            showToast('Failed to start impersonation', 'error');
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            <Toast toast={toast} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <ShieldCheck className="text-[#8b5cf6]" size={26} />
                        Admin Management
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">Manage all admin and super admin accounts</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/admin/admin-management/activity-logs"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 font-bold text-sm hover:bg-purple-100 transition-all"
                    >
                        <Activity size={15} />
                        All Activity Logs
                    </Link>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8b5cf6] text-white font-bold text-sm hover:bg-[#7c3aed] transition-all shadow-lg shadow-purple-500/20"
                    >
                        <UserPlus size={16} />
                        Add New Admin
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 size={36} className="animate-spin text-[#8b5cf6]" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                                    {['Admin', 'Status', 'Created', 'Last Login', 'Actions'].map(h => (
                                        <th key={h} className="py-4 px-6 text-xs font-black text-gray-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {admins.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-sm text-gray-400 italic">No admin accounts found.</td>
                                    </tr>
                                ) : admins.map(admin => (
                                    <tr key={admin.id} className="hover:bg-gray-50 transition-colors group">
                                        {/* Name + Email */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                    {admin.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{admin.name}</p>
                                                    <p className="text-xs text-gray-400">{admin.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Status */}
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold
                                                ${admin.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {admin.status}
                                            </span>
                                        </td>
                                        {/* Created */}
                                        <td className="py-4 px-6 text-sm text-gray-500">
                                            {new Date(admin.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                        </td>
                                        {/* Last Login */}
                                        <td className="py-4 px-6 text-sm text-gray-500 italic">
                                            {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                                        </td>
                                        {/* Actions */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-1">
                                                {/* View Dashboard (Impersonate) */}
                                                <button
                                                    onClick={() => handleImpersonate(admin)}
                                                    className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 text-gray-400 transition-colors"
                                                    title="View Dashboard"
                                                >
                                                    <LayoutDashboard size={15} />
                                                </button>
                                                {/* View Activity */}
                                                <button
                                                    onClick={() => window.location.href = `/admin/admin-management/${admin.id}/activity`}
                                                    className="p-2 rounded-lg hover:bg-purple-50 hover:text-[#8b5cf6] text-gray-400 transition-colors"
                                                    title="View Activity"
                                                >
                                                    <Eye size={15} />
                                                </button>
                                                {/* Suspend / Activate */}
                                                <button
                                                    onClick={() => handleToggleStatus(admin)}
                                                    className={`p-2 rounded-lg transition-colors ${admin.status === 'Active'
                                                        ? 'hover:bg-red-50 hover:text-red-500 text-gray-400'
                                                        : 'hover:bg-green-50 hover:text-green-500 text-gray-400'}`}
                                                    title={admin.status === 'Active' ? 'Suspend' : 'Activate'}
                                                >
                                                    {admin.status === 'Active' ? <Ban size={15} /> : <CheckCircle size={15} />}
                                                </button>
                                                {/* Reset Password */}
                                                <button
                                                    onClick={() => setResetTarget(admin)}
                                                    className="p-2 rounded-lg hover:bg-orange-50 hover:text-orange-500 text-gray-400 transition-colors"
                                                    title="Reset Password"
                                                >
                                                    <RefreshCw size={15} />
                                                </button>
                                                {/* Delete */}
                                                <button
                                                    onClick={() => setDeleteTarget(admin)}
                                                    className="p-2 rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-400 transition-colors"
                                                    title="Delete Admin"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Admin Modal */}
            {showAddModal && (
                <AddAdminModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={(msg) => { showToast(msg); fetchAdmins(); }}
                />
            )}

            {/* Reset Password Modal */}
            {resetTarget && (
                <ResetPasswordModal
                    admin={resetTarget}
                    onClose={() => setResetTarget(null)}
                    onSuccess={(msg) => showToast(msg)}
                />
            )}

            {/* Delete Confirm Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fadeIn">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-100 rounded-xl"><Trash2 size={20} className="text-red-600" /></div>
                            <h2 className="text-lg font-black text-gray-900">Delete Admin</h2>
                        </div>
                        <p className="text-gray-600 text-sm mb-5">
                            Are you sure you want to permanently delete <span className="font-bold text-gray-900">{deleteTarget.name}</span>?
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
                                Cancel
                            </button>
                            <button onClick={handleDeleteConfirm} disabled={deleting}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors shadow disabled:opacity-50 flex items-center justify-center gap-2">
                                {deleting ? <><Loader2 size={14} className="animate-spin" />Deleting…</> : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManagement;
