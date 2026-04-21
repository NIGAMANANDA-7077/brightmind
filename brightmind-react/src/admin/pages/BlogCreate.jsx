import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Eye, EyeOff, Loader2, Image as ImageIcon } from 'lucide-react';
import api from '../../utils/axiosConfig';

const CATEGORIES = ['General', 'Marketing', 'Design', 'Business', 'Development', 'Career', 'Skill', 'News'];

const BlogCreate = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [form, setForm] = useState({
        title: '',
        excerpt: '',
        content: '',
        image: '',
        category: 'General',
        status: 'Draft'
    });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditMode);
    const [error, setError] = useState('');
    const [preview, setPreview] = useState(false);

    useEffect(() => {
        if (!isEditMode) return;
        const fetchPost = async () => {
            try {
                const { data } = await api.get('/admin/blogs');
                const post = data.data?.find(p => p.id === id);
                if (post) {
                    setForm({
                        title: post.title || '',
                        excerpt: post.excerpt || '',
                        content: post.content || '',
                        image: post.image || '',
                        category: post.category || 'General',
                        status: post.status || 'Draft'
                    });
                }
            } catch (err) { console.error(err); }
            finally { setFetching(false); }
        };
        fetchPost();
    }, [id, isEditMode]);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e, publishNow = false) => {
        e.preventDefault();
        if (!form.title.trim()) { setError('Title is required.'); return; }
        if (!form.content.trim()) { setError('Content is required.'); return; }

        setLoading(true);
        setError('');
        try {
            const payload = { ...form, status: publishNow ? 'Published' : form.status };
            if (isEditMode) {
                await api.put(`/admin/blogs/${id}`, payload);
            } else {
                await api.post('/admin/blogs', payload);
            }
            navigate('/admin/blogs');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-[#8b5cf6]" size={36} /></div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <button onClick={() => navigate('/admin/blogs')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-medium mb-2 transition-colors">
                        <ArrowLeft size={18} /> Back to Blogs
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Blog Post' : 'Create New Blog Post'}</h1>
                </div>
                <button onClick={() => setPreview(!preview)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium transition-colors">
                    {preview ? <EyeOff size={16} /> : <Eye size={16} />}
                    {preview ? 'Edit Mode' : 'Preview'}
                </button>
            </div>

            {preview ? (
                /* Preview Mode */
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {form.image && <img src={form.image} alt="Cover" className="w-full h-64 object-cover" onError={e => e.target.style.display = 'none'} />}
                    <div className="p-8">
                        <span className="inline-block px-3 py-1 bg-purple-100 text-[#8b5cf6] text-xs font-bold rounded-full mb-4">{form.category}</span>
                        <h1 className="text-3xl font-bold text-gray-900 mb-3">{form.title || 'Post Title'}</h1>
                        {form.excerpt && <p className="text-gray-500 text-lg mb-6 italic border-l-4 border-purple-200 pl-4">{form.excerpt}</p>}
                        <div className="prose prose-gray max-w-none" dangerouslySetInnerHTML={{ __html: form.content || '<p>No content yet.</p>' }} />
                    </div>
                </div>
            ) : (
                /* Edit Form */
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-5">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                                <input name="title" value={form.title} onChange={handleChange} placeholder="Enter a compelling title..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] text-gray-900 font-medium text-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Excerpt / Summary</label>
                                <textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={3} placeholder="Short description shown on blog cards..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] resize-none text-gray-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Content * <span className="text-gray-400 font-normal">(HTML supported)</span></label>
                                <textarea name="content" value={form.content} onChange={handleChange} rows={18} placeholder="<h2>Introduction</h2><p>Your blog content here...</p>" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] resize-none font-mono text-sm text-gray-700" />
                                <p className="text-xs text-gray-400 mt-1">You can use HTML tags: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;</p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Settings */}
                    <div className="space-y-5">
                        {/* Publish Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                            <h3 className="font-bold text-gray-900">Publish</h3>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                                <select name="status" value={form.status} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 text-gray-700 text-sm">
                                    <option value="Draft">Draft</option>
                                    <option value="Published">Published</option>
                                </select>
                            </div>
                            {error && <p className="text-red-500 text-sm font-medium bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
                            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white py-3 rounded-xl font-bold transition-all shadow-md disabled:opacity-70">
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {isEditMode ? 'Update Post' : 'Save Post'}
                            </button>
                            {!isEditMode && (
                                <button type="button" onClick={(e) => handleSubmit(e, true)} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-70">
                                    Publish Now
                                </button>
                            )}
                        </div>

                        {/* Image Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2"><ImageIcon size={18} className="text-[#8b5cf6]" /> Cover Image</h3>
                            <input name="image" value={form.image} onChange={handleChange} placeholder="Paste image URL (Unsplash, etc.)" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 text-sm text-gray-700" />
                            {form.image && (
                                <img src={form.image} alt="Preview" className="w-full h-32 object-cover rounded-xl border border-gray-100" onError={e => e.target.style.display = 'none'} />
                            )}
                        </div>

                        {/* Category Card */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                            <h3 className="font-bold text-gray-900">Category</h3>
                            <select name="category" value={form.category} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 text-gray-700 text-sm">
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
};

export default BlogCreate;
