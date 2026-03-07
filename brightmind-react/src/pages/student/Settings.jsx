import React, { useState, useRef } from 'react';
import PageTransition from '../../components/common/PageTransition';
import { User, Bell, Lock, Globe, Moon, Camera, Phone, Mail, MessageSquare, Send, Upload } from 'lucide-react';
import api from '../../utils/axiosConfig';
import { useUser } from '../../context/UserContext';
import { avatarOptions, studentSupport } from '../../data/studentData';

const Settings = () => {
    const { user, updateUser } = useUser();
    const [activeTab, setActiveTab] = useState('Profile');
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [showAvatarModal, setShowAvatarModal] = useState(false);

    // Form States - Initialize with global user data
    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
        bio: user?.bio || "Passionate learner exploring the world of React and UI Design."
    });

    const [notifs, setNotifs] = useState({
        'Course Updates': true,
        'Mentor Messages': true,
        'Live Class Reminders': true,
        'Promotions': false
    });

    const [darkMode, setDarkMode] = useState(false);

    const [passwords, setPasswords] = useState({
        current: '',
        new: ''
    });

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage('');

        try {
            await updateUser({
                name: profile.name,
                email: profile.email,
                bio: profile.bio
            });
            setSaveMessage('Changes saved successfully!');
        } catch (err) {
            setSaveMessage('Failed to save changes.');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };

    const fileInputRef = useRef(null);

    const handleAvatarChange = async (avatarUrl) => {
        try {
            setIsSaving(true);
            await updateUser({ avatar: avatarUrl });
            setShowAvatarModal(false);
            setSaveMessage('Avatar updated!');
        } catch (err) {
            setSaveMessage('Failed to update avatar.');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsSaving(true);
        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                await updateUser({ avatar: res.data.url });
                setSaveMessage('Avatar uploaded successfully!');
                setShowAvatarModal(false);
            }
        } catch (err) {
            console.error("Failed to upload avatar", err);
            setSaveMessage('Failed to upload image.');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };

    const toggleNotif = (item) => {
        setNotifs(prev => ({ ...prev, [item]: !prev[item] }));
    };

    const [supportForm, setSupportForm] = useState({ subject: '', message: '' });

    const handleSupportSubmit = (e) => {
        e.preventDefault();
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            console.log('Contact admin initiated (mock)', supportForm);
            setIsSaving(false);
            setSaveMessage('Support request sent (mock)');
            setSupportForm({ subject: '', message: '' });
            setTimeout(() => setSaveMessage(''), 3000);
        }, 1000);
    };

    const tabs = [
        { name: 'Profile', icon: User },
        { name: 'Account', icon: Lock },
        { name: 'Notifications', icon: Bell },
        { name: 'Preferences', icon: Globe },
        { name: 'Support', icon: MessageSquare },
    ];

    return (
        <PageTransition>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                        <p className="text-gray-500 mt-1">Manage your account preferences</p>
                    </div>
                    {saveMessage && (
                        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-bold animate-bounce">
                            {saveMessage}
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                    {/* Sidebar Tabs */}
                    <div className="w-full md:w-64 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100 p-4">
                        <div className="space-y-1">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.name}
                                        onClick={() => setActiveTab(tab.name)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === tab.name
                                            ? 'bg-white text-[#8b5cf6] shadow-sm'
                                            : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                                            }`}
                                    >
                                        <Icon size={18} />
                                        {tab.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-8">
                        {activeTab === 'Profile' && (
                            <div className="space-y-6 animate-fade-in relative">
                                <div className="flex items-center gap-6">
                                    <div className="relative group cursor-pointer" onClick={() => setShowAvatarModal(true)}>
                                        <img src={user.avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-gray-50 shadow-sm group-hover:opacity-80 transition-opacity" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="text-white" size={24} />
                                        </div>
                                    </div>
                                    <div>
                                        <button
                                            onClick={() => setShowAvatarModal(true)}
                                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors"
                                        >
                                            Change Avatar
                                        </button>
                                        <p className="text-xs text-gray-500 mt-2">Click to choose a new avatar</p>
                                    </div>
                                </div>
                                <div className="space-y-4 max-w-md">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Display Name</label>
                                        <input
                                            type="text"
                                            value={profile.name}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#8b5cf6] outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#8b5cf6] outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Bio</label>
                                        <textarea
                                            rows="3"
                                            value={profile.bio}
                                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#8b5cf6] outline-none transition-all"
                                        ></textarea>
                                    </div>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className={`px-6 py-3 bg-[#8b5cf6] text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:bg-[#7c3aed] transition-all flex items-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Saving...
                                            </>
                                        ) : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Notifications' && (
                            <div className="space-y-6 animate-fade-in max-w-md">
                                <h3 className="font-bold text-gray-900 text-lg">Email Notifications</h3>
                                <div className="space-y-4">
                                    {Object.keys(notifs).map(item => (
                                        <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <span className="text-sm font-bold text-gray-700">{item}</span>
                                            <div
                                                onClick={() => toggleNotif(item)}
                                                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${notifs[item] ? 'bg-[#8b5cf6]' : 'bg-gray-300'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${notifs[item] ? 'right-1' : 'left-1'}`}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-6 py-3 bg-[#8b5cf6] text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:bg-[#7c3aed] transition-all mt-4"
                                >
                                    {isSaving ? 'Saving...' : 'Save Preferences'}
                                </button>
                            </div>
                        )}

                        {activeTab === 'Preferences' && (
                            <div className="space-y-6 animate-fade-in max-w-md">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-200 rounded-lg text-gray-600"><Moon size={20} /></div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm">Dark Mode</h4>
                                            <p className="text-xs text-gray-500">Switch between light and dark themes</p>
                                        </div>
                                    </div>
                                    <div
                                        onClick={() => setDarkMode(!darkMode)}
                                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${darkMode ? 'bg-[#8b5cf6]' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${darkMode ? 'right-1' : 'left-1'}`}></div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-6 py-3 bg-[#8b5cf6] text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:bg-[#7c3aed] transition-all"
                                >
                                    {isSaving ? 'Saving...' : 'Save Preferences'}
                                </button>
                            </div>
                        )}

                        {activeTab === 'Account' && (
                            <div className="space-y-6 animate-fade-in max-w-md">
                                <h3 className="font-bold text-gray-900 text-lg">Security</h3>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={passwords.current}
                                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#8b5cf6] outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={passwords.new}
                                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-[#8b5cf6] outline-none transition-all"
                                    />
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || !passwords.current || !passwords.new}
                                    className={`px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all ${isSaving ? 'opacity-50' : ''}`}
                                >
                                    {isSaving ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        )}

                        {activeTab === 'Support' && (
                            <div className="space-y-6 animate-fade-in max-w-xl">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Need Help? Contact Administration</h3>
                                    <p className="text-gray-500 text-sm mt-1">
                                        If you are facing any technical or academic issue, you can directly contact the admin team.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <a
                                        href={`tel:${studentSupport.phone}`}
                                        onClick={() => console.log('Contact admin initiated (mock): Phone')}
                                        className="p-4 bg-blue-50 hover:bg-blue-100 rounded-2xl flex flex-col items-center justify-center gap-2 group transition-colors border border-blue-100"
                                    >
                                        <div className="bg-white p-3 rounded-full text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                                            <Phone size={24} />
                                        </div>
                                        <span className="font-bold text-gray-900">Call Admin</span>
                                        <span className="text-xs text-blue-600 font-medium">{studentSupport.phone}</span>
                                    </a>
                                    <a
                                        href={`mailto:${studentSupport.email}?subject=Student Support Request`}
                                        onClick={() => console.log('Contact admin initiated (mock): Email')}
                                        className="p-4 bg-purple-50 hover:bg-purple-100 rounded-2xl flex flex-col items-center justify-center gap-2 group transition-colors border border-purple-100"
                                    >
                                        <div className="bg-white p-3 rounded-full text-purple-600 shadow-sm group-hover:scale-110 transition-transform">
                                            <Mail size={24} />
                                        </div>
                                        <span className="font-bold text-gray-900">Email Admin</span>
                                        <span className="text-xs text-purple-600 font-medium">{studentSupport.email}</span>
                                    </a>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <MessageSquare size={18} className="text-[#8b5cf6]" />
                                        Quick Message
                                    </h4>
                                    <form onSubmit={handleSupportSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Login Issue"
                                                value={supportForm.subject}
                                                onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                                                required
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#8b5cf6] outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                                            <textarea
                                                rows="3"
                                                placeholder="Describe your issue..."
                                                value={supportForm.message}
                                                onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                                                required
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:border-[#8b5cf6] outline-none transition-all"
                                            ></textarea>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="px-6 py-3 bg-[#8b5cf6] text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:bg-[#7c3aed] transition-all flex items-center gap-2 w-full justify-center"
                                        >
                                            <Send size={18} />
                                            {isSaving ? 'Sending...' : 'Send Message'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Avatar Selection Modal */}
                {showAvatarModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-fade-in p-4">
                        <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Choose Avatar</h3>
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                {avatarOptions.map((url, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleAvatarChange(url)}
                                        className={`rounded-full overflow-hidden border-4 transition-all ${user.avatar === url ? 'border-[#8b5cf6] scale-110' : 'border-transparent hover:border-gray-200 hover:scale-105'}`}
                                    >
                                        <img src={url} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                                {/* Upload your own */}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="rounded-full overflow-hidden border-4 border-dashed border-gray-300 hover:border-[#8b5cf6] hover:bg-purple-50 transition-all flex flex-col items-center justify-center text-gray-500 hover:text-[#8b5cf6] min-h-[100px]"
                                >
                                    <Upload size={24} className="mb-2" />
                                    <span className="text-xs font-bold">Upload</span>
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowAvatarModal(false)}
                                    className="px-5 py-2.5 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PageTransition >
    );
};

export default Settings;
