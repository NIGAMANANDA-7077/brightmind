import React, { useState, useRef } from 'react';
import PageTransition from '../../components/common/PageTransition';
import { User, Lock, Moon, Sun, Camera, Check, X, Loader2, HelpCircle, MessageSquare, Eye, EyeOff } from 'lucide-react';
import api from '../../utils/axiosConfig';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';

// ── Reusable primitives ────────────────────────────────────────────────────────
const Field = ({ label, children }) => (
    <div>
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            {label}
        </label>
        {children}
    </div>
);

const Input = ({ readOnly, className = '', ...props }) => (
    <input
        readOnly={readOnly}
        {...props}
        className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] transition-colors
            ${readOnly
                ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                : 'border-gray-200 bg-white text-gray-900'}
            ${className}`}
    />
);

const SaveBtn = ({ status, label = 'Save Changes', loadingLabel = 'Saving...', disabled }) => (
    <button
        type="submit"
        disabled={status === 'loading' || disabled}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8b5cf6] text-white text-sm font-bold hover:bg-[#7c3aed] transition-all disabled:opacity-50 shadow-md shadow-purple-500/20"
    >
        {status === 'loading' ? <><Loader2 size={15} className="animate-spin" />{loadingLabel}</> :
         status === 'success' ? <><Check size={15} />Saved!</> :
         status === 'error'   ? <><X size={15} />Failed</> :
         label}
    </button>
);

// ──────────────────────────────────────────────────────────────────────────────
const Settings = () => {
    const { user, refreshUser } = useUser();
    const { isDarkMode, setTheme } = useTheme();
    const [tab, setTab] = useState('Profile');

    // ── Profile ───────────────────────────────────────────────────────────────
    const fileRef = useRef(null);
    const [name, setName] = useState(user?.name || '');
    const [bio, setBio]   = useState(user?.bio  || '');
    const [profileStatus, setProfileStatus] = useState(null);

    const saveProfile = async (e) => {
        e.preventDefault();
        setProfileStatus('loading');
        try {
            await api.put('/student/profile', { name, bio });
            await refreshUser();
            setProfileStatus('success');
        } catch {
            setProfileStatus('error');
        } finally {
            setTimeout(() => setProfileStatus(null), 2500);
        }
    };

    const uploadAvatar = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('file', file);
        setProfileStatus('loading');
        try {
            const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (res.data.success) {
                await api.put('/student/profile', { avatar: res.data.url });
                await refreshUser();
                setProfileStatus('success');
            }
        } catch {
            setProfileStatus('error');
        } finally {
            setTimeout(() => setProfileStatus(null), 2500);
        }
    };

    // ── Password ──────────────────────────────────────────────────────────────
    const [pw, setPw]       = useState({ current: '', next: '', confirm: '' });
    const [pwStatus, setPwStatus] = useState(null);
    const [pwError, setPwError]   = useState('');
    const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });

    const changePassword = async (e) => {
        e.preventDefault();
        setPwError('');
        if (pw.next !== pw.confirm) { setPwError('Passwords do not match'); return; }
        if (pw.next.length < 6)     { setPwError('Minimum 6 characters'); return; }
        setPwStatus('loading');
        try {
            await api.put('/student/change-password', { current_password: pw.current, new_password: pw.next });
            setPw({ current: '', next: '', confirm: '' });
            setPwStatus('success');
        } catch (err) {
            setPwError(err.response?.data?.message || 'Current password is incorrect');
            setPwStatus('error');
        } finally {
            setTimeout(() => setPwStatus(null), 2500);
        }
    };

    // ── Preferences ───────────────────────────────────────────────────────────
    const [prefStatus, setPrefStatus] = useState(null);

    const handleToggleDarkMode = async () => {
        const newTheme = isDarkMode ? 'light' : 'dark';
        setTheme(newTheme); // immediate UI update + persistence via ThemeContext
        setPrefStatus('loading');
        try {
            await api.put('/student/preferences', { dark_mode: newTheme === 'dark' });
            setPrefStatus('success');
        } catch {
            setPrefStatus('error');
        } finally {
            setTimeout(() => setPrefStatus(null), 2000);
        }
    };

    // ── Support ───────────────────────────────────────────────────────────────
    const [ticket, setTicket]             = useState({ subject: '', message: '' });
    const [ticketStatus, setTicketStatus] = useState(null);

    const sendTicket = async (e) => {
        e.preventDefault();
        setTicketStatus('loading');
        try {
            await api.post('/student/support', ticket);
            setTicket({ subject: '', message: '' });
            setTicketStatus('success');
        } catch {
            setTicketStatus('error');
        } finally {
            setTimeout(() => setTicketStatus(null), 3000);
        }
    };

    // ── Sidebar tabs ──────────────────────────────────────────────────────────
    const tabs = [
        { id: 'Profile',     icon: User },
        { id: 'Account',     icon: Lock },
        { id: 'Preferences', icon: Moon },
        { id: 'Support',     icon: HelpCircle },
    ];

    return (
        <PageTransition>
            <div className="max-w-4xl mx-auto pb-12">
                {/* Page header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-black text-gray-900">Settings</h1>
                    <p className="text-sm text-gray-400 mt-1">Manage your account and preferences</p>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* ── Sidebar ─────────────────────────────────────────── */}
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

                    {/* ── Panel ───────────────────────────────────────────── */}
                    <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">

                        {/* ─── PROFILE ──────────────────────────────────────── */}
                        {tab === 'Profile' && (
                            <form onSubmit={saveProfile} className="space-y-6 max-w-md">
                                <h2 className="text-base font-black text-gray-900">Profile</h2>

                                {/* Avatar */}
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <img
                                            src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
                                            alt="avatar"
                                            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileRef.current?.click()}
                                            className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#8b5cf6] text-white rounded-full flex items-center justify-center hover:bg-[#7c3aed] transition-colors shadow"
                                        >
                                            <Camera size={12} />
                                        </button>
                                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{user?.name}</p>
                                        <p className="text-xs text-gray-400">Click the camera icon to change photo</p>
                                    </div>
                                </div>

                                <Field label="Display Name">
                                    <Input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Your name"
                                        required
                                    />
                                </Field>

                                <Field label="Bio (optional)">
                                    <textarea
                                        value={bio}
                                        onChange={e => setBio(e.target.value)}
                                        rows={3}
                                        placeholder="Tell something about yourself..."
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] resize-none"
                                    />
                                </Field>

                                <SaveBtn status={profileStatus} />
                            </form>
                        )}

                        {/* ─── ACCOUNT ──────────────────────────────────────── */}
                        {tab === 'Account' && (
                            <div className="space-y-8 max-w-md">
                                <h2 className="text-base font-black text-gray-900">Account</h2>

                                <Field label="Email Address">
                                    <Input type="email" value={user?.email || ''} readOnly />
                                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                                </Field>

                                <div className="border-t border-gray-100 pt-6">
                                    <h3 className="text-sm font-black text-gray-800 mb-4">Change Password</h3>
                                    <form onSubmit={changePassword} className="space-y-4">
                                        <Field label="Current Password">
                                            <div className="relative">
                                                <Input
                                                    type={showPw.current ? 'text' : 'password'}
                                                    value={pw.current}
                                                    onChange={e => setPw(p => ({ ...p, current: e.target.value }))}
                                                    required
                                                    placeholder="••••••••"
                                                    className="pr-10"
                                                />
                                                <button type="button" onClick={() => setShowPw(s => ({ ...s, current: !s.current }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                    {showPw.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </Field>
                                        <Field label="New Password">
                                            <div className="relative">
                                                <Input
                                                    type={showPw.next ? 'text' : 'password'}
                                                    value={pw.next}
                                                    onChange={e => setPw(p => ({ ...p, next: e.target.value }))}
                                                    required
                                                    placeholder="Min 6 characters"
                                                    className="pr-10"
                                                />
                                                <button type="button" onClick={() => setShowPw(s => ({ ...s, next: !s.next }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                    {showPw.next ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </Field>
                                        <Field label="Confirm New Password">
                                            <div className="relative">
                                                <Input
                                                    type={showPw.confirm ? 'text' : 'password'}
                                                    value={pw.confirm}
                                                    onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
                                                    required
                                                    placeholder="••••••••"
                                                    className="pr-10"
                                                />
                                                <button type="button" onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                                    {showPw.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </Field>
                                        {pwError && (
                                            <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                                                <X size={12} />{pwError}
                                            </p>
                                        )}
                                        <SaveBtn status={pwStatus} label="Update Password" loadingLabel="Updating..." />
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* ─── PREFERENCES ──────────────────────────────────── */}
                        {tab === 'Preferences' && (
                            <div className="space-y-6 max-w-md">
                                <h2 className="text-base font-black text-gray-900">Preferences</h2>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        {isDarkMode
                                            ? <Moon size={18} className="text-[#8b5cf6]" />
                                            : <Sun size={18} className="text-amber-400" />}
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Dark Mode</p>
                                            <p className="text-xs text-gray-400 mt-0.5">Switch between light and dark</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleToggleDarkMode}
                                        aria-label="Toggle dark mode"
                                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${isDarkMode ? 'bg-[#8b5cf6]' : 'bg-gray-200'}`}
                                    >
                                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                {/* Status feedback */}
                                {prefStatus === 'loading' && (
                                    <p className="text-xs text-gray-400 flex items-center gap-1.5">
                                        <Loader2 size={12} className="animate-spin" />Saving preference…
                                    </p>
                                )}
                                {prefStatus === 'success' && (
                                    <p className="text-xs text-green-600 flex items-center gap-1.5">
                                        <Check size={12} />Preference saved!
                                    </p>
                                )}
                                {prefStatus === 'error' && (
                                    <p className="text-xs text-red-500 flex items-center gap-1.5">
                                        <X size={12} />Could not save preference.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* ─── SUPPORT ──────────────────────────────────────── */}
                        {tab === 'Support' && (
                            <div className="space-y-6 max-w-md">
                                <div>
                                    <h2 className="text-base font-black text-gray-900">Support</h2>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Having an issue? Send us a message and we'll get back to you.
                                    </p>
                                </div>

                                <form onSubmit={sendTicket} className="space-y-4">
                                    <Field label="Subject">
                                        <Input
                                            type="text"
                                            value={ticket.subject}
                                            onChange={e => setTicket(t => ({ ...t, subject: e.target.value }))}
                                            required
                                            placeholder="e.g. Cannot access my course"
                                        />
                                    </Field>
                                    <Field label="Message">
                                        <textarea
                                            value={ticket.message}
                                            onChange={e => setTicket(t => ({ ...t, message: e.target.value }))}
                                            rows={5}
                                            required
                                            placeholder="Describe your issue in detail..."
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] resize-none"
                                        />
                                    </Field>

                                    {ticketStatus === 'success' && (
                                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
                                            <Check size={14} className="text-green-600 shrink-0" />
                                            <p className="text-xs text-green-700 font-medium">
                                                Message sent! Our team will look into it shortly.
                                            </p>
                                        </div>
                                    )}
                                    {ticketStatus === 'error' && (
                                        <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                                            <X size={12} />Failed to send. Please try again.
                                        </p>
                                    )}

                                    <SaveBtn
                                        status={ticketStatus}
                                        label="Send Message"
                                        loadingLabel="Sending..."
                                        disabled={ticketStatus === 'success'}
                                    />
                                </form>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Settings;
