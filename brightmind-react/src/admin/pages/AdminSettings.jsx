import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../utils/axiosConfig';
import {
    User, Globe, Camera, Loader2, Check, X, Sun, Moon,
} from 'lucide-react';

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

// ── Shared UI ──────────────────────────────────────────────────────────────────
const Field = ({ label, hint, children }) => (
    <div className="space-y-1.5">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</label>
        {children}
        {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
);

const TextInput = ({ readOnly, className = '', ...props }) => (
    <input
        readOnly={readOnly}
        {...props}
        className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6]
            ${readOnly ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border-gray-200 text-gray-900'}
            ${className}`}
    />
);

const SaveButton = ({ loading }) => (
    <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#8b5cf6] text-white font-bold text-sm hover:bg-[#7c3aed] transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
    >
        {loading ? <><Loader2 size={16} className="animate-spin" />Saving…</> : 'Save Changes'}
    </button>
);

// ──────────────────────────────────────────────────────────────────────────────
const AdminSettings = () => {
    const { user, refreshUser } = useUser();
    const { isDarkMode, setTheme } = useTheme();
    const [tab, setTab] = useState('Profile');
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const tabs = [
        { id: 'Profile', icon: User },
        { id: 'System',  icon: Globe },
    ];

    // ── Profile ───────────────────────────────────────────────────────────────
    const fileRef = useRef(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profile, setProfile] = useState({ name: user?.name || '', avatar: user?.avatar || '' });
    const [uploading, setUploading] = useState(false);

    const uploadAvatar = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('file', file);
        setUploading(true);
        try {
            const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (res.data.success) {
                setProfile(p => ({ ...p, avatar: res.data.url }));
                showToast('Photo uploaded!');
            }
        } catch {
            showToast('Failed to upload photo.', 'error');
        } finally {
            setUploading(false);
        }
    };

    const saveProfile = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        try {
            await api.patch('/admin/profile', { name: profile.name, avatar: profile.avatar });
            await refreshUser();
            showToast('Profile updated successfully!');
        } catch {
            showToast('Failed to update profile.', 'error');
        } finally {
            setProfileLoading(false);
        }
    };

    // ── System Settings ───────────────────────────────────────────────────────
    const [sysLoading, setSysLoading] = useState(false);
    const [system, setSystem] = useState({ lmsName: '', timezone: 'IST', supportEmail: '' });
    const [themeLoading, setThemeLoading] = useState(false);

    useEffect(() => {
        api.get('/admin/settings/system')
            .then(res => { if (res.data.success) setSystem(res.data.data); })
            .catch(() => {});
    }, []);

    const saveSystem = async (e) => {
        e.preventDefault();
        setSysLoading(true);
        try {
            await api.patch('/admin/settings/system', system);
            showToast('System settings saved!');
        } catch {
            showToast('Failed to save system settings.', 'error');
        } finally {
            setSysLoading(false);
        }
    };

    const handleThemeToggle = async () => {
        const nextTheme = isDarkMode ? 'light' : 'dark';
        setTheme(nextTheme);
        setThemeLoading(true);
        try {
            await api.put('/users/theme', { theme: nextTheme });
            showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} mode`);
        } catch {
            showToast('Failed to update theme preference.', 'error');
        } finally {
            setThemeLoading(false);
        }
    };


    return (
        <div className="max-w-4xl mx-auto pb-12">
            <Toast toast={toast} />

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-black text-gray-900">Settings</h1>
                <p className="text-sm text-gray-400 mt-1">Manage system configuration and admin preferences</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* ── Sidebar ─────────────────────────────────────────────── */}
                <aside className="w-full md:w-52 shrink-0">
                    <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 space-y-0.5">
                        {tabs.map(({ id, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setTab(id)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all
                                    ${tab === id
                                        ? 'bg-[#8b5cf6]/10 text-[#8b5cf6]'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
                            >
                                <Icon size={16} />
                                {id}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* ── Panel ───────────────────────────────────────────────── */}
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">

                    {/* ─── PROFILE ──────────────────────────────────────────── */}
                    {tab === 'Profile' && (
                        <form onSubmit={saveProfile} className="space-y-6 max-w-md">
                            <h2 className="text-base font-black text-gray-900">Profile</h2>

                            {/* Avatar */}
                            <div className="flex items-center gap-5">
                                <div className="relative">
                                    <img
                                        src={profile.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'Admin')}`}
                                        alt="avatar"
                                        className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileRef.current?.click()}
                                        disabled={uploading}
                                        className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#8b5cf6] text-white rounded-full flex items-center justify-center hover:bg-[#7c3aed] transition-colors shadow disabled:opacity-50"
                                    >
                                        {uploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
                                    </button>
                                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{user?.name}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Click the camera icon to update photo</p>
                                </div>
                            </div>

                            <Field label="Full Name">
                                <TextInput
                                    type="text"
                                    value={profile.name}
                                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                                    placeholder="Admin full name"
                                    required
                                />
                            </Field>

                            <Field label="Email Address" hint="Email cannot be changed">
                                <TextInput type="email" value={user?.email || ''} readOnly />
                            </Field>

                            <Field label="Role">
                                <TextInput type="text" value={user?.role === 'SuperAdmin' ? 'Super Admin' : 'Admin'} readOnly />
                            </Field>

                            <div className="pt-2">
                                <SaveButton loading={profileLoading} />
                            </div>
                        </form>
                    )}

                    {/* ─── SYSTEM ───────────────────────────────────────────── */}
                    {tab === 'System' && (
                        <form onSubmit={saveSystem} className="space-y-6 max-w-md">
                            <h2 className="text-base font-black text-gray-900">System Settings</h2>

                            <div className="flex items-center justify-between gap-4 p-4 bg-white border border-gray-100 rounded-xl">
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Theme</p>
                                    <p className="text-xs text-gray-500">Applies across the admin panel</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleThemeToggle}
                                    disabled={themeLoading}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                >
                                    {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                                    {themeLoading ? 'Saving...' : isDarkMode ? 'Light Mode' : 'Dark Mode'}
                                </button>
                            </div>

                            <Field label="LMS Name">
                                <TextInput
                                    type="text"
                                    value={system.lmsName}
                                    onChange={e => setSystem(s => ({ ...s, lmsName: e.target.value }))}
                                    placeholder="e.g. BrightMIND Academy"
                                    required
                                />
                            </Field>

                            <Field label="Default Timezone">
                                <select
                                    value={system.timezone}
                                    onChange={e => setSystem(s => ({ ...s, timezone: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] transition-colors"
                                >
                                    <option value="IST">India Standard Time (IST)</option>
                                    <option value="UTC">Coordinated Universal Time (UTC)</option>
                                    <option value="EST">Eastern Standard Time (EST)</option>
                                    <option value="PST">Pacific Standard Time (PST)</option>
                                    <option value="GMT">Greenwich Mean Time (GMT)</option>
                                </select>
                            </Field>

                            <Field label="Support Email">
                                <TextInput
                                    type="email"
                                    value={system.supportEmail}
                                    onChange={e => setSystem(s => ({ ...s, supportEmail: e.target.value }))}
                                    placeholder="support@yourschool.com"
                                />
                            </Field>

                            <div className="pt-2">
                                <SaveButton loading={sysLoading} />
                            </div>
                        </form>
                    )}


                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
