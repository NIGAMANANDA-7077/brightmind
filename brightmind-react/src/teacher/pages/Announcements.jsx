import React, { useState } from 'react';
import { useSharedAnnouncements } from '../../context/SharedAnnouncementsContext';
import { useBatch } from '../../context/BatchContext';
import { Megaphone, Plus, X, Send, Eye, Bell, Calendar, Filter } from 'lucide-react';

// =========================================================
// Teacher Announcements 
// Teachers can only post to their specific batches.
// =========================================================

const statusColor = {
    Published: 'bg-green-100 text-green-700',
    Scheduled: 'bg-blue-100 text-blue-600',
    Draft: 'bg-gray-100 text-gray-500',
};

const Announcements = () => {
    const { announcements, addAnnouncement } = useSharedAnnouncements();
    const { myBatches } = useBatch(); // Teacher's batches

    const [showForm, setShowForm] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [form, setForm] = useState({ title: '', message: '', batchId: '', date: '' });
    const [formError, setFormError] = useState('');
    const [filterBatch, setFilterBatch] = useState('All');

    const handlePost = (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.message.trim() || !form.batchId) { 
            setFormError('Title, message, and batch are required.'); 
            return; 
        }
        const payload = form.batchId === '__all__'
            ? { title: form.title, message: form.message, date: form.date, audience: 'Student', allMyBatches: true }
            : { ...form, audience: 'Student' };
        addAnnouncement(payload);
        setForm({ title: '', message: '', batchId: '', date: '' });
        setFormError('');
        setShowForm(false);
    };

    const filtered = announcements
        .filter(a => filterBatch === 'All' || a.batchId === filterBatch)
        .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

    return (
        <div className="max-w-[1400px] mx-auto animate-fadeIn">
            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowPreview(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-900">Preview</h3>
                            <button onClick={() => setShowPreview(false)}><X size={20} className="text-gray-400" /></button>
                        </div>
                        <div className="p-7">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#8b5cf6]/10 text-[#8b5cf6] mb-4">
                                For Batch: {myBatches.find(b => b.id === form.batchId)?.batchName || 'Unknown Batch'}
                            </span>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">{form.title || 'Untitled'}</h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{form.message || 'No content...'}</p>
                        </div>
                        <div className="p-4 bg-gray-50 text-right">
                            <button onClick={() => setShowPreview(false)} className="px-5 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
                    <p className="text-gray-500">Post updates directly to your batch students</p>
                </div>
                <div className="flex gap-3">
                    <select
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#8b5cf6]/20"
                        value={filterBatch}
                        onChange={e => setFilterBatch(e.target.value)}
                    >
                        <option value="All">All Your Batches</option>
                        {myBatches.map(b => (
                            <option key={b.id} value={b.id}>{b.batchName}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-[#8b5cf6] text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-[#7c3aed] transition-colors"
                    >
                        <Plus size={18} /> Post
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Form */}
                {showForm && (
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Send size={18} className="text-[#8b5cf6]" /> New Announcement
                            </h2>
                            <form onSubmit={handlePost} className="space-y-4">
                                {formError && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Title</label>
                                    <input required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/20" placeholder="Announcement title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Message</label>
                                    <textarea required rows={5} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 resize-none" placeholder="Write your message..." value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Select Batch</label>
                                    <select required className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/20" value={form.batchId} onChange={e => setForm(p => ({ ...p, batchId: e.target.value }))}>
                                        <option value="">-- Choose Batch --</option>
                                        <option value="__all__">📢 All My Batches</option>
                                        {myBatches.map(b => (
                                            <option key={b.id} value={b.id}>{b.batchName} ({b.course?.title})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex gap-2 pt-1">
                                    <button type="button" onClick={() => setShowPreview(true)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1">
                                        <Eye size={16} /> Preview
                                    </button>
                                    <button type="submit" className="flex-[2] bg-[#8b5cf6] hover:bg-[#7c3aed] text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-1">
                                        <Megaphone size={16} /> Publish
                                    </button>
                                </div>
                                <button type="button" onClick={() => setShowForm(false)} className="w-full py-2 text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Announcements List */}
                <div className={showForm ? 'lg:col-span-2' : 'lg:col-span-3'}>
                    {filtered.length === 0 ? (
                        <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                            <Filter size={36} className="mx-auto mb-3 opacity-20" />
                            <p className="font-medium">No announcements match your filters</p>
                            <button onClick={() => setFilterBatch('All')} className="mt-2 text-[#8b5cf6] font-bold text-sm hover:underline">Clear Filters</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filtered.map(an => (
                                <div key={an.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex gap-4">
                                    <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-50 text-blue-600`}>
                                        <Bell size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <h3 className="text-base font-bold text-gray-900 group-hover:text-[#8b5cf6] transition-colors">{an.title}</h3>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor[an.status] || 'bg-gray-100 text-gray-500'}`}>{an.status || 'Published'}</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-3">
                                            <span className="flex items-center gap-1"><Calendar size={11} /> {new Date(an.createdAt || an.date).toLocaleDateString()}</span>
                                            {an.batch ? (
                                                <span className="px-2 py-0.5 rounded-lg border text-xs font-medium bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/20">Batch: {an.batch.batchName}</span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-lg border text-xs font-medium bg-gray-100 text-gray-600">Global</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{an.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Announcements;
