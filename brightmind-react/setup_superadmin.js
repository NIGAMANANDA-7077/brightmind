const fs = require('fs');
const path = require('path');

// Create directories
fs.mkdirSync('src/superadmin/layouts', { recursive: true });
fs.mkdirSync('src/superadmin/pages', { recursive: true });
console.log('Directories created.');

// ── SuperAdminLayout.jsx ──────────────────────────────────────────────────────
const superAdminLayout = `import React, { useState } from 'react';
import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { ShieldCheck, Users, LogOut, ChevronLeft, ChevronRight, X, Menu } from 'lucide-react';
import { useUser } from '../../context/UserContext';

const SuperAdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, loading, logout } = useUser();

    if (loading) return null;
    if (!user || user.role !== 'SuperAdmin') {
        return <Navigate to="/login" replace />;
    }

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="flex bg-gray-50 min-h-screen">
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={\`bg-white border-r border-gray-100 shadow-xl h-screen fixed top-0 left-0 z-50 flex flex-col transition-all duration-300
                \${collapsed ? 'w-20' : 'w-64'}
                \${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0\`}>

                {/* Header */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
                    {!collapsed && (
                        <div>
                            <h1 className="font-bold text-xl text-[#8b5cf6]">BrightMIND</h1>
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Super Admin</p>
                        </div>
                    )}
                    {collapsed && <ShieldCheck size={24} className="text-[#8b5cf6] mx-auto" />}
                    <button onClick={() => setMobileOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600 ml-auto">
                        <X size={20} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-6 px-4">
                    <NavLink
                        to="/superadmin/admin-management"
                        className={({ isActive }) => \`
                            flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                            \${isActive ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-purple-50 hover:text-purple-700'}
                        \`}
                    >
                        <Users size={22} className={collapsed ? 'mx-auto' : ''} />
                        {!collapsed && <span>Admin Management</span>}
                    </NavLink>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium"
                    >
                        <LogOut size={20} className={collapsed ? 'mx-auto' : ''} />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden md:flex absolute -right-3 top-24 bg-white text-gray-900 p-1.5 rounded-full shadow-md border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                    {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </aside>

            {/* Main */}
            <div className={\`flex-1 flex flex-col min-w-0 transition-all duration-300 \${collapsed ? 'md:ml-20' : 'md:ml-64'}\`}>
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30">
                    <button onClick={() => setMobileOpen(true)} className="md:hidden text-gray-500 hover:text-gray-700">
                        <Menu size={22} />
                    </button>
                    <div className="flex items-center gap-3 ml-auto">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-sm">
                            {user?.name?.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900 leading-none">{user?.name}</p>
                            <p className="text-xs text-purple-600 font-semibold">Super Admin</p>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default SuperAdminLayout;
`;

// ── AdminManagement.jsx (copy from admin) ────────────────────────────────────
const adminManagementSrc = path.join(__dirname, 'src', 'admin', 'pages', 'AdminManagement.jsx');
const adminManagementContent = fs.readFileSync(adminManagementSrc, 'utf8');

// ── AdminActivity.jsx ─────────────────────────────────────────────────────────
const adminActivity = `import React, { useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';
import { Activity, Loader2, ChevronDown, ChevronUp, Search } from 'lucide-react';

const ACTION_LABELS = {
    CREATE_COURSE: 'Created Course',
    UPDATE_COURSE: 'Updated Course',
    DELETE_COURSE: 'Deleted Course',
    CREATE_EXAM: 'Created Exam',
    UPDATE_EXAM: 'Updated Exam',
    DELETE_EXAM: 'Deleted Exam',
    CREATE_BATCH: 'Created Batch',
    UPDATE_BATCH: 'Updated Batch',
    ASSIGN_BATCH: 'Assigned Batch',
    CREATE_USER: 'Created User',
    UPDATE_USER: 'Updated User',
    DELETE_USER: 'Deleted User',
    UPDATE_SETTINGS: 'Updated Settings',
    CREATE_ANNOUNCEMENT: 'Created Announcement',
    OTHER: 'Other',
};

const ACTION_COLORS = {
    CREATE_COURSE: 'bg-green-100 text-green-700',
    UPDATE_COURSE: 'bg-blue-100 text-blue-700',
    DELETE_COURSE: 'bg-red-100 text-red-700',
    CREATE_EXAM: 'bg-green-100 text-green-700',
    UPDATE_EXAM: 'bg-blue-100 text-blue-700',
    DELETE_EXAM: 'bg-red-100 text-red-700',
    CREATE_BATCH: 'bg-green-100 text-green-700',
    UPDATE_BATCH: 'bg-blue-100 text-blue-700',
    ASSIGN_BATCH: 'bg-purple-100 text-purple-700',
    CREATE_USER: 'bg-green-100 text-green-700',
    UPDATE_USER: 'bg-blue-100 text-blue-700',
    DELETE_USER: 'bg-red-100 text-red-700',
    UPDATE_SETTINGS: 'bg-yellow-100 text-yellow-700',
    CREATE_ANNOUNCEMENT: 'bg-indigo-100 text-indigo-700',
    OTHER: 'bg-gray-100 text-gray-700',
};

const AdminActivity = () => {
    const [admins, setAdmins] = useState([]);
    const [logs, setLogs] = useState({});
    const [loadingAdmins, setLoadingAdmins] = useState(true);
    const [loadingLogs, setLoadingLogs] = useState({});
    const [expanded, setExpanded] = useState({});
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const res = await api.get('/superadmin/admins');
                if (res.data.success) setAdmins(res.data.admins);
            } catch {
                // ignore
            } finally {
                setLoadingAdmins(false);
            }
        };
        fetchAdmins();
    }, []);

    const toggleExpand = async (adminId) => {
        const isExpanded = !!expanded[adminId];
        setExpanded(prev => ({ ...prev, [adminId]: !isExpanded }));
        if (!isExpanded && !logs[adminId]) {
            setLoadingLogs(prev => ({ ...prev, [adminId]: true }));
            try {
                const res = await api.get(\`/superadmin/admins/\${adminId}/activity\`);
                setLogs(prev => ({ ...prev, [adminId]: res.data.logs || [] }));
            } catch {
                setLogs(prev => ({ ...prev, [adminId]: [] }));
            } finally {
                setLoadingLogs(prev => ({ ...prev, [adminId]: false }));
            }
        }
    };

    const filtered = admins.filter(a =>
        a.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <Activity className="text-[#8b5cf6]" size={26} />
                        Admin Activity
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">View activity logs for each admin</p>
                </div>
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search admins\u2026"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 w-56"
                    />
                </div>
            </div>

            {/* Admin List */}
            {loadingAdmins ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 size={36} className="animate-spin text-[#8b5cf6]" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm italic">
                    No admins found.
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(admin => (
                        <div key={admin.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            {/* Admin Row */}
                            <button
                                onClick={() => toggleExpand(admin.id)}
                                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center text-white font-bold text-sm shrink-0">
                                        {admin.name?.charAt(0)}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-gray-900 text-sm">{admin.name}</p>
                                        <p className="text-xs text-gray-400">{admin.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={\`text-xs font-bold px-2.5 py-0.5 rounded-full \${admin.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}\`}>
                                        {admin.status}
                                    </span>
                                    {expanded[admin.id] ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                                </div>
                            </button>

                            {/* Activity Logs */}
                            {expanded[admin.id] && (
                                <div className="border-t border-gray-100 px-6 py-4">
                                    {loadingLogs[admin.id] ? (
                                        <div className="flex items-center justify-center py-6">
                                            <Loader2 size={22} className="animate-spin text-[#8b5cf6]" />
                                        </div>
                                    ) : !logs[admin.id] || logs[admin.id].length === 0 ? (
                                        <p className="text-sm text-gray-400 italic text-center py-4">No activity logs found.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {logs[admin.id].map(log => (
                                                <div key={log.id} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
                                                    <span className={\`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 mt-0.5 \${ACTION_COLORS[log.actionType] || ACTION_COLORS.OTHER}\`}>
                                                        {ACTION_LABELS[log.actionType] || log.actionType}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-gray-700">{log.actionDescription}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            {new Date(log.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminActivity;
`;

// Write files
fs.writeFileSync('src/superadmin/layouts/SuperAdminLayout.jsx', superAdminLayout);
console.log('Created: src/superadmin/layouts/SuperAdminLayout.jsx');

fs.writeFileSync('src/superadmin/pages/AdminManagement.jsx', adminManagementContent);
console.log('Created: src/superadmin/pages/AdminManagement.jsx');

fs.writeFileSync('src/superadmin/pages/AdminActivity.jsx', adminActivity);
console.log('Created: src/superadmin/pages/AdminActivity.jsx');

console.log('\nAll files created successfully!');
