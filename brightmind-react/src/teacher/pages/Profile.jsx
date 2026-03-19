import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import api from '../../utils/axiosConfig';
import { Edit2, Check, X, Mail, Phone, BookOpen, Award, Camera, Shield, Zap, Target, Loader2 } from 'lucide-react';

const Profile = () => {
    const { user: ctxUser, updateUser, refreshUser } = useUser();
    const [profile, setProfile] = useState(ctxUser || null);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({});
    const [saved, setSaved] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);

    // Fetch fresh profile from API on mount (ensures admin edits are reflected)
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/teacher/profile');
                if (res.data.success) {
                    setProfile(res.data.user);
                }
            } catch (err) {
                // Fallback to context user if API fails
                setProfile(ctxUser);
            }
        };
        fetchProfile();
    }, []);

    if (!profile) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-[#8b5cf6]" size={40} /></div>;

    const handleEdit = () => {
        setForm({
            name:          profile.name          || '',
            phone:         profile.phone         || '',
            subject:       profile.subject       || '',
            qualification: profile.qualification || '',
            experience:    profile.experience    || '',
            bio:           profile.bio           || '',
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setForm({});
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateUser(form);
            // Refresh from DB so profile reflects latest state
            const fresh = await refreshUser();
            if (fresh) setProfile(fresh);
            else setProfile(prev => ({ ...prev, ...form }));
            setIsEditing(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error('Save failed', err);
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                const newAvatar = res.data.url;
                await updateUser({ avatar: newAvatar });
                setProfile(prev => ({ ...prev, avatar: newAvatar }));
            }
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-20">
            {/* Minimal Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Profile Settings</h1>
                    <p className="text-gray-500 font-medium">Manage your professional identity and teaching credentials</p>
                </div>
                {isEditing ? (
                    <div className="flex gap-3">
                        <button
                            onClick={handleCancel}
                            className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all flex items-center gap-2"
                        >
                            <X size={16} /> Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2.5 rounded-xl bg-[#8b5cf6] text-white font-bold text-sm hover:bg-[#7c3aed] transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2 disabled:opacity-70"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleEdit}
                        className="px-6 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-900 font-bold text-sm hover:border-[#8b5cf6] hover:text-[#8b5cf6] transition-all flex items-center gap-2 shadow-sm"
                    >
                        <Edit2 size={16} /> Edit Profile
                    </button>
                )}
            </div>

            {/* Premium Profile card */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[2rem] blur opacity-15" />
                <div className="relative bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-xl shadow-purple-500/5">
                    {/* Visual Banner */}
                    <div className="h-32 bg-gradient-to-br from-[#8b5cf6] via-[#7c3aed] to-[#6d28d9] relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20">
                            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                            </svg>
                        </div>
                    </div>

                    <div className="px-8 pb-8 flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="relative -mt-16 mb-6">
                            <div className="absolute -inset-1.5 bg-white rounded-full" />
                            <img
                                src={profile.avatar}
                                alt={profile.name}
                                className="relative w-32 h-32 rounded-full border-4 border-transparent bg-gray-100 shadow-xl object-cover"
                            />
                            {isEditing && (
                                <>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        disabled={uploading}
                                        className="absolute bottom-1 right-1 p-2.5 bg-white rounded-full shadow-lg border border-gray-100 text-[#8b5cf6] hover:scale-110 transition-transform disabled:opacity-50"
                                    >
                                        {uploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="flex-1 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                {isEditing ? (
                                    <input
                                        className="text-3xl font-black text-gray-900 border-b-2 border-[#8b5cf6] bg-transparent outline-none w-full mb-2"
                                        value={form.name}
                                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    />
                                ) : (
                                    <h2 className="text-3xl font-black text-gray-900 mb-1">{profile.name}</h2>
                                )}
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <span className="px-3 py-1 bg-purple-50 text-[#8b5cf6] text-xs font-black uppercase tracking-wider rounded-lg border border-purple-100">{profile.subject} Expert</span>
                                    <span className="text-gray-400 font-medium text-sm flex items-center gap-1.5"><Shield size={14} /> Verified Faculty</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <div className="p-3 bg-gray-50 rounded-2xl text-center min-w-[90px]">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Dept</p>
                                    <p className="text-sm font-bold text-gray-900">{profile.department}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-2xl text-center min-w-[90px]">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Join Year</p>
                                    <p className="text-sm font-bold text-gray-900">{profile.joinedDate ? new Date(profile.joinedDate).getFullYear() : (profile.createdAt ? new Date(profile.createdAt).getFullYear() : '—')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & Info */}
                <div className="lg:col-span-1 space-y-6">


                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Contact Info</h3>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                                {/* Email is always read-only — cannot be changed by teacher */}
                                <p className="text-sm font-bold text-gray-900 flex items-center gap-2"><Mail size={14} className="text-[#8b5cf6]" /> {profile.email}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                                {isEditing ? (
                                    <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                ) : (
                                    <p className="text-sm font-bold text-gray-900 flex items-center gap-2"><Phone size={14} className="text-[#8b5cf6]" /> {profile.phone}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Narrative & Credentials */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm min-h-[400px]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Professional Summary</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Short Bio</label>
                                {isEditing ? (
                                    <textarea
                                        rows={4}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 resize-none"
                                        value={form.bio}
                                        onChange={e => setForm({ ...form, bio: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-lg text-gray-600 leading-relaxed font-medium">
                                        {profile.bio}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Qualification</label>
                                    {isEditing ? (
                                        <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} />
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <div className="bg-orange-50 text-orange-500 p-2 rounded-xl"><Award size={20} /></div>
                                            <p className="font-bold text-gray-900">{profile.qualification}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Experience</label>
                                    {isEditing ? (
                                        <input className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} placeholder="e.g. 5 years" />
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-50 text-green-500 p-2 rounded-xl"><Zap size={20} /></div>
                                            <p className="font-bold text-gray-900">{profile.experience}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Badges/Achievements Section */}
                        {!isEditing && (
                            <div className="mt-12 pt-8 border-t border-gray-50">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Achievements</h4>
                                <div className="flex flex-wrap gap-3">
                                    <span className="px-4 py-2 bg-gray-100 rounded-xl text-xs font-bold text-gray-600">Level 8 Faculty</span>
                                    <span className="px-4 py-2 bg-gray-100 rounded-xl text-xs font-bold text-gray-600">Top Monthly Educator</span>
                                    <span className="px-4 py-2 bg-gray-100 rounded-xl text-xs font-bold text-gray-600">Master Researcher</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
