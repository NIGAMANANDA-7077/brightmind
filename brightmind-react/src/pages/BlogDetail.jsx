import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { blogPosts } from '../data/blog';
import { Star, Clock, Calendar, Facebook, Twitter, Linkedin, Share2 } from 'lucide-react';
import RelatedPosts from '../components/RelatedPosts';
import CTASection from '../components/CTASection';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const BlogDetail = () => {
    const { slug } = useParams();
    const post = blogPosts.find(p => p.slug === slug);
    const [contentRef, contentVisible] = useScrollAnimation({ threshold: 0.05, once: true });

    if (!post) {
        return <Navigate to="/blog" replace />;
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
                        {post.date}
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                    </div>
                    <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                        <img
                            src={post.author.avatar}
                            alt={post.author.name}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-gray-900">{post.author.name}</span>
                    </div>
                </div>
            </div>

            {/* Hero Image */}
            <div className="container-custom mb-16 px-4 md:px-0">
                <div className="rounded-[2.5rem] overflow-hidden shadow-2xl h-[400px] md:h-[600px]">
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            {/* Content Layout */}
            <div className="container-custom max-w-6xl mx-auto mb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Main Content */}
                    <div
                        ref={contentRef}
                        className={`lg:col-span-8 transition-all duration-1000 ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    >
                        <div
                            className="prose prose-lg prose-purple max-w-none text-gray-600 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Share Card - Sticky */}
                        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 sticky top-32">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
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

            <RelatedPosts currentId={post.id} />
            <CTASection />
        </div>
    );
};

export default BlogDetail;
