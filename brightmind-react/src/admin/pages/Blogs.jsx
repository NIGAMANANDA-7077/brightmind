import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Newspaper, Loader2 } from 'lucide-react';
import api from '../../utils/axiosConfig';

const AdminBlogs = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/admin/blogs');
            if (data.success) setPosts(data.data);
        } catch (err) {
            console.error('Failed to fetch blogs', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPosts(); }, []);

    const handleTogglePublish = async (post) => {
        try {
            const { data } = await api.patch(`/admin/blogs/${post.id}/publish`);
            if (data.success) setPosts(prev => prev.map(p => p.id === post.id ? data.data : p));
        } catch (err) { console.error(err); }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        setDeleting(true);
        try {
            await api.delete(`/admin/blogs/${deleteConfirm.id}`);
            setPosts(prev => prev.filter(p => p.id !== deleteConfirm.id));
            setDeleteConfirm(null);
        } catch (err) { console.error(err); }
        finally { setDeleting(false); }
    };

    const filtered = posts.filter(p => {
        const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'All' || p.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <div className="space-y-6">
            {/* Delete Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Blog Post?</h3>
                        <p className="text-gray-500 text-sm mb-6">This will permanently delete "<strong>{deleteConfirm.title}</strong>".</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 flex items-center justify-center gap-2">
                                {deleting ? <Loader2 size={16} className="animate-spin" /> : null} Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
                    <p className="text-gray-500">Manage and publish blog articles</p>
                </div>
                <Link to="/admin/blogs/create" className="flex items-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 w-fit">
                    <Plus size={20} /> New Blog Post
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Search blog posts..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 text-gray-600" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="All">All Status</option>
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                </select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total', value: posts.length, color: 'bg-purple-50 text-[#8b5cf6]' },
                    { label: 'Published', value: posts.filter(p => p.status === 'Published').length, color: 'bg-green-50 text-green-600' },
                    { label: 'Draft', value: posts.filter(p => p.status === 'Draft').length, color: 'bg-yellow-50 text-yellow-600' }
                ].map(s => (
                    <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
                        <p className="text-2xl font-bold">{s.value}</p>
                        <p className="text-xs font-semibold">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Blog Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-[#8b5cf6]" size={36} /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(post => (
                        <div key={post.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
                            {/* Thumbnail */}
                            <div className="relative h-44 bg-gradient-to-br from-purple-100 to-blue-50 overflow-hidden">
                                {post.image ? (
                                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Newspaper size={40} className="text-purple-300" />
                                    </div>
                                )}
                                <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md ${post.status === 'Published' ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-white'}`}>
                                    {post.status}
                                </span>
                                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/80 text-white backdrop-blur-md">
                                    {post.category}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2">{post.title}</h3>
                                {post.excerpt && <p className="text-xs text-gray-400 line-clamp-2 mb-2">{post.excerpt}</p>}
                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-auto mb-3">
                                    <span>By {post.authorName || 'Admin'}</span>
                                    <span>•</span>
                                    <span>{post.readTime || '5 Min Read'}</span>
                                    <span>•</span>
                                    <span>{post.views || 0} views</span>
                                </div>

                                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleTogglePublish(post)} className="p-2 text-gray-400 hover:text-[#8b5cf6] hover:bg-purple-50 rounded-lg transition-colors" title={post.status === 'Published' ? 'Unpublish' : 'Publish'}>
                                            {post.status === 'Published' ? <Eye size={16} /> : <EyeOff size={16} />}
                                        </button>
                                        <Link to={`/admin/blogs/edit/${post.id}`} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                            <Edit size={16} />
                                        </Link>
                                        <button onClick={() => setDeleteConfirm(post)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filtered.length === 0 && !loading && (
                        <div className="col-span-full py-20 text-center">
                            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Newspaper className="text-gray-300" size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No blog posts found</h3>
                            <p className="text-gray-500 mb-4">Create your first blog post to get started.</p>
                            <Link to="/admin/blogs/create" className="inline-flex items-center gap-2 bg-[#8b5cf6] text-white px-5 py-2.5 rounded-xl font-bold">
                                <Plus size={18} /> Create Blog Post
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminBlogs;
