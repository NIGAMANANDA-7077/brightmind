import React, { useState, useEffect } from 'react';
import { useAdminGlobal } from '../context/AdminGlobalContext';
import { Bell, Calendar, Send, Trash2, Megaphone, Check, X, Eye, Edit2, Filter } from 'lucide-react';

const Announcements = () => {
    const { announcements, announcementActions } = useAdminGlobal();

    // Form and UI State
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        audience: 'All',
        date: '',
        status: 'Published' // Will be calculated on submit
    });

    // Functional States
    const [isEditing, setIsEditing] = useState(null); // ID of announcement being edited
    const [showPreview, setShowPreview] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);

    // Filters
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterAudience, setFilterAudience] = useState('All');

    // Auto-Publish Logic (Mock Timer)
    useEffect(() => {
        const checkSchedule = setInterval(() => {
            const now = new Date().toISOString().split('T')[0];
            announcements.forEach(a => {
                if (a.status === 'Scheduled' && a.date <= now) {
                    announcementActions.updateAnnouncement(a.id, { status: 'Published' });
                    showToast(`Auto-published: ${a.title}`);
                }
            });
        }, 5000); // Check every 5 seconds for demo purposes

        return () => clearInterval(checkSchedule);
    }, [announcements, announcementActions]);

    // Toast Helper
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Form Handlers
    const handleSubmit = (e) => {
        e.preventDefault();

        const today = new Date().toISOString().split('T')[0];
        const scheduleDate = formData.date || today;
        const status = scheduleDate > today ? 'Scheduled' : 'Published';

        const finalData = {
            ...formData,
            date: scheduleDate,
            status: status
        };

        if (isEditing) {
            announcementActions.updateAnnouncement(isEditing, finalData);
            showToast('Announcement updated successfully');
            setIsEditing(null);
        } else {
            announcementActions.addAnnouncement(finalData);
            showToast(status === 'Scheduled' ? 'Announcement scheduled' : 'Announcement published');
        }

        // Reset
        setFormData({ title: '', message: '', audience: 'All', date: '', status: 'Published' });
    };

    const handleEdit = (announcement) => {
        setFormData({
            title: announcement.title,
            message: announcement.message,
            audience: announcement.audience,
            date: announcement.date,
            status: announcement.status
        });
        setIsEditing(announcement.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = () => {
        if (deleteConfirmId) {
            announcementActions.deleteAnnouncement(deleteConfirmId);
            setDeleteConfirmId(null);
            showToast('Announcement deleted');
        }
    };

    // Filter Logic
    const sortedAnnouncements = [...announcements].sort((a, b) => {
        // Published first, then Scheduled, then Draft
        const rank = { 'Published': 1, 'Scheduled': 2, 'Draft': 3 };
        return rank[a.status] - rank[b.status];
    });

    const filteredAnnouncements = sortedAnnouncements.filter(a => {
        const matchStatus = filterStatus === 'All' || a.status === filterStatus;
        const matchAudience = filterAudience === 'All' || a.audience === filterAudience;
        return matchStatus && matchAudience;
    });

    return (
        <div className="max-w-[1600px] mx-auto animate-fadeIn relative">

            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed top-24 right-8 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-slideIn z-50">
                    <Check size={18} className="text-green-400" />
                    {toastMessage}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setDeleteConfirmId(null)}>
                    <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Announcement?</h3>
                        <p className="text-gray-500 mb-6">This action cannot be undone.</p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-50 font-bold">Cancel</button>
                            <button onClick={handleDelete} className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 font-bold">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowPreview(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-900">Preview</h3>
                            <button onClick={() => setShowPreview(false)}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
                        </div>
                        <div className="p-8">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#8b5cf6]/10 text-[#8b5cf6] mb-4">
                                {formData.audience}
                            </span>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">{formData.title || "Untitled Announcement"}</h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{formData.message || "No content..."}</p>
                            <div className="mt-8 pt-6 border-t border-gray-100 text-sm text-gray-400 flex items-center gap-2">
                                <Calendar size={14} /> Scheduled: {formData.date || "Today"}
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 text-right">
                            <button onClick={() => setShowPreview(false)} className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold">Close Preview</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
                    <p className="text-gray-500">Broadcast messages to students and teachers</p>
                </div>

                {/* Filters */}
                <div className="flex gap-3">
                    <select
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 text-sm font-medium"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Published">Published</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Draft">Draft</option>
                    </select>
                    <select
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 text-sm font-medium"
                        value={filterAudience}
                        onChange={(e) => setFilterAudience(e.target.value)}
                    >
                        <option value="All">All Audiences</option>
                        <option value="Students">Students</option>
                        <option value="Teachers">Teachers</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create/Edit Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Send size={20} className="text-[#8b5cf6]" />
                            {isEditing ? 'Edit Announcement' : 'Create New'}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Exam Schedule Update"
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Message</label>
                                <textarea
                                    required
                                    rows="6"
                                    placeholder="Type your message here..."
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all resize-none"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Audience</label>
                                    <select
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
                                        value={formData.audience}
                                        onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                                    >
                                        <option value="All">All Users</option>
                                        <option value="Students">Students Only</option>
                                        <option value="Teachers">Teachers Only</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Schedule (Opt)</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPreview(true)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                >
                                    <Eye size={18} /> Preview
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] bg-[#8b5cf6] hover:bg-[#7c3aed] text-white py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                                >
                                    <Megaphone size={18} /> {isEditing ? 'Update' : 'Publish'}
                                </button>
                            </div>

                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => { setIsEditing(null); setFormData({ title: '', message: '', audience: 'All', date: '', status: 'Published' }); }}
                                    className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Cancel Editing
                                </button>
                            )}
                        </form>
                    </div>
                </div>

                {/* Announcements List */}
                <div className="lg:col-span-2 space-y-4">
                    {filteredAnnouncements.map((announcement) => (
                        <div key={announcement.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4 group hover:shadow-md transition-shadow relative">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 
                                ${announcement.audience === 'Students' ? 'bg-blue-50 text-blue-600' :
                                    announcement.audience === 'Teachers' ? 'bg-orange-50 text-orange-600' : 'bg-purple-50 text-purple-600'}
                            `}>
                                <Bell size={24} />
                            </div>
                            <div className="flex-1 pr-12">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#8b5cf6] transition-colors">{announcement.title}</h3>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className={`px-2 py-1 rounded-full font-bold
                                            ${announcement.status === 'Published' ? 'bg-green-100 text-green-700' :
                                                announcement.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}
                                        `}>
                                            {announcement.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {announcement.date}</span>
                                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
                                        For: {announcement.audience}
                                    </span>
                                </div>

                                <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                                    {announcement.message}
                                </p>
                            </div>

                            {/* Actions Overlay */}
                            <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(announcement)}
                                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => setDeleteConfirmId(announcement.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredAnnouncements.length === 0 && (
                        <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <Filter size={24} className="text-gray-300" />
                            </div>
                            <p>No announcements match your filters.</p>
                            <button
                                onClick={() => { setFilterStatus('All'); setFilterAudience('All'); }}
                                className="mt-2 text-[#8b5cf6] font-bold text-sm hover:underline"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Announcements;
