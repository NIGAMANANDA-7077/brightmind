import { useAdminGlobal } from '../context/AdminGlobalContext';
import { useUser } from '../../context/UserContext';
import api from '../../utils/axiosConfig';
import { Save, Lock, Bell, Palette, Globe, Shield, User, Camera, Loader2 } from 'lucide-react';

const AdminSettingsPage = () => {
    const { settings, updateSettings } = useAdminGlobal();
    const { user, updateUser } = useUser();
    const [activeTab, setActiveTab] = useState('Profile');
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        avatar: user?.avatar || ''
    });
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef(null);

    const handleSave = async () => {
        if (activeTab === 'Profile') {
            await updateUser(profileForm);
            alert('Profile updated successfully!');
        } else {
            alert('Settings saved successfully!');
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
                setProfileForm(prev => ({ ...prev, avatar: newAvatar }));
            }
        } catch (err) {
            console.error("Upload failed", err);
            alert("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const tabs = [
        { id: 'Profile', icon: User, label: 'My Profile' },
        { id: 'General', icon: Globe, label: 'General' },
        { id: 'Security', icon: Shield, label: 'Security' },
        { id: 'Notifications', icon: Bell, label: 'Notifications' },
    ];

    return (
        <div className="max-w-4xl mx-auto animate-fadeIn">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500">Manage system-wide configurations and preferences</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all
                    ${activeTab === tab.id
                                        ? 'bg-[#8b5cf6]/5 text-[#8b5cf6] border-l-4 border-[#8b5cf6]'
                                        : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'}
                  `}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        {activeTab === 'Profile' && (
                            <div className="space-y-8 animate-fadeIn">
                                <div className="flex flex-col items-center border-b border-gray-50 pb-8">
                                    <div className="relative group">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur opacity-25 group-hover:opacity-40 transition-opacity" />
                                        <img
                                            src={profileForm.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80"}
                                            alt="Profile"
                                            className="relative w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                            className="absolute bottom-1 right-1 p-2.5 bg-white rounded-full shadow-lg border border-gray-100 text-[#8b5cf6] hover:scale-110 transition-transform disabled:opacity-50"
                                        >
                                            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                                        </button>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                    </div>
                                    <div className="mt-4 text-center">
                                        <h3 className="text-xl font-bold text-gray-900">{profileForm.name}</h3>
                                        <p className="text-sm text-gray-500 font-medium">Administrator</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium"
                                            value={profileForm.name}
                                            onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Email Address</label>
                                        <input
                                            type="email"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium"
                                            value={profileForm.email}
                                            onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'General' && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">General Settings</h2>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">LMS Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
                                        value={settings.lmsName}
                                        onChange={(e) => updateSettings({ lmsName: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Default Timezone</label>
                                    <select
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
                                        value={settings.timezone}
                                        onChange={(e) => updateSettings({ timezone: e.target.value })}
                                    >
                                        <option value="IST">India Standard Time (IST)</option>
                                        <option value="UTC">Coordinated Universal Time (UTC)</option>
                                        <option value="EST">Eastern Standard Time (EST)</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Security' && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Security Settings</h2>

                                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                                    <div>
                                        <p className="font-bold text-gray-900">Two-Factor Authentication</p>
                                        <p className="text-xs text-gray-500">Require 2FA for all admin accounts</p>
                                    </div>
                                    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                        <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                                        <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Password Policy</label>
                                    <select
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
                                        value={settings.passwordPolicy}
                                        onChange={(e) => updateSettings({ passwordPolicy: e.target.value })}
                                    >
                                        <option value="Strong">Strong (Min 10 chars, special char)</option>
                                        <option value="Medium">Medium (Min 8 chars)</option>
                                        <option value="Weak">Weak (Min 6 chars)</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Notifications' && (
                            <div className="space-y-6 animate-fadeIn">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Notification Preferences</h2>

                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={settings.notifications.email}
                                            onChange={(e) => updateSettings({ notifications: { ...settings.notifications, email: e.target.checked } })}
                                            className="w-5 h-5 text-[#8b5cf6] rounded focus:ring-[#8b5cf6]"
                                        />
                                        <span className="font-medium text-gray-700">Email Notifications</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={settings.notifications.sms}
                                            onChange={(e) => updateSettings({ notifications: { ...settings.notifications, sms: e.target.checked } })}
                                            className="w-5 h-5 text-[#8b5cf6] rounded focus:ring-[#8b5cf6]"
                                        />
                                        <span className="font-medium text-gray-700">SMS Notifications</span>
                                    </label>
                                </div>
                            </div>
                        )}


                        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20"
                            >
                                <Save size={20} /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettingsPage;
