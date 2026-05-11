import React, { useState, useEffect } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Star, Clock, Calendar, Facebook, Twitter, Linkedin, Share2, Loader2, ArrowLeft } from 'lucide-react';
import RelatedPosts from '../components/RelatedPosts';
import CTASection from '../components/CTASection';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import api from '../utils/axiosConfig';

const BlogDetail = () => {
    const { slug } = useParams();
    const [contentRef, contentVisible] = useScrollAnimation({ threshold: 0.01, once: true, rootMargin: '100px' });
    
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                const { data } = await api.get(`/blogs/${slug}`);
                if (data.success) {
                    setPost(data.data);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
        // scroll to top on new post
        window.scrollTo(0, 0);
    }, [slug]);

    if (loading) {
        return <div className="pt-32 pb-20 flex justify-center"><Loader2 className="animate-spin text-[#8b5cf6]" size={40} /></div>;
    }

    if (error || !post) {
        return (
            <div className="pt-32 pb-20 text-center container-custom">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
                <p className="text-gray-500 mb-8">The post you're looking for doesn't exist or has been removed.</p>
                <Link to="/blog" className="inline-flex items-center gap-2 bg-[#8b5cf6] text-white px-6 py-3 rounded-full font-bold">
                    <ArrowLeft size={18} /> Back to Blog
                </Link>
            </div>
        );
    }

    return (
        <div className="pt-28 pb-0">
            {/* Top Header Section */}
            <div className="container-custom max-w-5xl mx-auto text-center mb-12">
                <div className="inline-block bg-[#8b5cf6]/10 text-[#8b5cf6] px-4 py-1.5 rounded-full font-bold text-sm mb-6 uppercase tracking-wider">
                    {post.category}
                </div>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight">
                    {post.title}
                </h1>

                {/* Meta Row */}
                <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-gray-500 font-medium">
                    <div className="flex items-center gap-1 text-orange-400">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {post.readTime || '5 Min Read'}
                    </div>
                    <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                        {post.authorAvatar && (
                            <img
                                src={post.authorAvatar}
                                alt={post.authorName}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        )}
                        <span className="text-gray-900">{post.authorName || 'BrightMind Expert'}</span>
                    </div>
                </div>
            </div>

            {/* Hero Image */}
            {post.image && (
                <div className="container-custom mb-16 px-4 md:px-0">
                    <div className="rounded-[2.5rem] overflow-hidden shadow-2xl h-[400px] md:h-[600px]">
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            )}

            {/* Content Layout */}
            <div className="container-custom max-w-6xl mx-auto mb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Main Content */}
                    <div
                        ref={contentRef}
                        className={`lg:col-span-8 transition-all duration-1000 ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    >
                        {post.excerpt && (
                            <p className="text-xl text-gray-500 italic border-l-4 border-purple-200 pl-4 mb-8">
                                {post.excerpt}
                            </p>
                        )}
                        <div
                            className="prose prose-lg prose-purple max-w-none text-gray-600 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Share Card - Sticky */}
                        <div className="p-8 rounded-3xl shadow-lg sticky top-32" style={{backgroundColor:'var(--card-bg)', border:'1px solid var(--border-color)'}}>
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{color:'var(--text-primary)'}}>
                                <Share2 className="w-5 h-5 text-[#8b5cf6]" />
                                Share this article
                            </h3>
                            <div className="flex gap-4">
                                <button className="flex-1 bg-[#1877f2] hover:bg-[#166fe5] text-white py-3 rounded-xl transition-colors flex items-center justify-center">
                                    <Facebook className="w-5 h-5" />
                                </button>
                                <button className="flex-1 bg-[#1da1f2] hover:bg-[#1a91da] text-white py-3 rounded-xl transition-colors flex items-center justify-center">
                                    <Twitter className="w-5 h-5" />
                                </button>
                                <button className="flex-1 bg-[#0a66c2] hover:bg-[#0958a8] text-white py-3 rounded-xl transition-colors flex items-center justify-center">
                                    <Linkedin className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <RelatedPosts currentSlug={post.slug} currentCategory={post.category} />
            <CTASection />
        </div>
    );
};

export default BlogDetail;
