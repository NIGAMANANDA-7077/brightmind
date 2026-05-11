import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { Loader2, Newspaper } from 'lucide-react';

const RelatedPosts = ({ currentSlug, currentCategory }) => {
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRelated = async () => {
            try {
                // Fetch posts from the same category
                let { data } = await api.get(`/blogs?category=${currentCategory}&limit=4`);
                let posts = data.data?.filter(p => p.slug !== currentSlug) || [];

                // If not enough in category, fetch latest to fill out
                if (posts.length < 3) {
                    const latest = await api.get('/blogs?limit=5');
                    const morePosts = latest.data.data?.filter(p => p.slug !== currentSlug && !posts.find(existing => existing.id === p.id));
                    posts = [...posts, ...(morePosts || [])];
                }

                setRelated(posts.slice(0, 3));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (currentSlug) {
            fetchRelated();
        }
    }, [currentSlug, currentCategory]);

    if (loading) {
        return <div className="py-20 flex justify-center" style={{backgroundColor:'var(--bg-secondary)'}}><Loader2 className="animate-spin text-gray-400" /></div>;
    }

    if (related.length === 0) return null;

    return (
        <section className="py-20" style={{backgroundColor:'var(--bg-secondary)'}}>
            <div className="container-custom">
                <h3 className="text-3xl font-bold mb-10" style={{color:'var(--text-primary)'}}>Related Articles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {related.map(post => (
                        <Link to={`/blog/${post.slug}`} key={post.id} className="group block">
                            <div className="rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col" style={{backgroundColor:'var(--card-bg)'}}>
                                <div className="h-48 overflow-hidden relative bg-purple-50 flex items-center justify-center">
                                    {post.image ? (
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <Newspaper className="text-purple-200" size={40} />
                                    )}
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-gray-900 shadow-sm uppercase">
                                        {post.category}
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <h4 className="text-xl font-bold mb-4 group-hover:text-[#8b5cf6] transition-colors line-clamp-2" style={{color:'var(--text-primary)'}}>
                                        {post.title}
                                    </h4>
                                    <div className="mt-auto flex items-center gap-2 text-xs text-gray-400">
                                        <span>{new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        <span>•</span>
                                        <span>{post.readTime || '5 Min Read'}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RelatedPosts;
