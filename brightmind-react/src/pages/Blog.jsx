import React, { useState, useEffect } from 'react';
import BlogCard from '../components/BlogCard';
import CTASection from '../components/CTASection';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { Loader2 } from 'lucide-react';
import api from '../utils/axiosConfig';

const Blog = () => {
    const [headerRef, headerVisible] = useScrollAnimation({ threshold: 0.1, once: true });
    const [gridRef, gridVisible] = useScrollAnimation({ threshold: 0.01, once: true, rootMargin: '100px' });

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const LIMIT = 9;

    const fetchPosts = async (pageNum = 1) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/blogs?page=${pageNum}&limit=${LIMIT}`);
            if (data.success) {
                if (pageNum === 1) {
                    setPosts(data.data);
                } else {
                    setPosts(prev => [...prev, ...data.data]);
                }
                setTotal(data.total);
            }
        } catch (err) {
            console.error('Failed to fetch blogs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPosts(1); }, []);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPosts(nextPage);
    };

    return (
        <div className="pt-20">
            {/* Page Header */}
            <section className="py-20 bg-white text-center">
                <div
                    ref={headerRef}
                    className={`container-custom transition-all duration-1000 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                >
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                        Latest Articles & <span className="text-[#8b5cf6]">Insights</span>
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
                        Discover valuable insights and resources to boost your learning and
                        career growth on the BrightMind blog.
                    </p>
                </div>
            </section>

            {/* Blogs Grid */}
            <section className="pb-20 bg-[#fbfbfb] pt-12">
                <div className="container-custom">
                    {loading && posts.length === 0 ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="animate-spin text-[#8b5cf6]" size={40} />
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                            <p className="text-xl font-medium">No blog posts published yet.</p>
                            <p className="text-sm mt-2">Check back soon!</p>
                        </div>
                    ) : (
                        <>
                            <div
                                ref={gridRef}
                                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 stagger-children ${gridVisible ? 'visible' : ''}`}
                            >
                                {posts.map((post) => (
                                    <div key={post.id}>
                                        <BlogCard post={post} />
                                    </div>
                                ))}
                            </div>

                            {posts.length < total && (
                                <div className="text-center">
                                    <button
                                        onClick={loadMore}
                                        disabled={loading}
                                        className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-3.5 rounded-full font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 flex items-center gap-2 mx-auto"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={18} /> : null}
                                        Load More Articles
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <CTASection />
        </div>
    );
};

export default Blog;
