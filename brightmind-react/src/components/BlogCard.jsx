import React from 'react';
import { Link } from 'react-router-dom';

const BlogCard = ({ post }) => {
    return (
        <Link to={`/blog/${post.slug}`} className="block h-full cursor-pointer relative z-10">
            <div className="rounded-3xl p-4 overflow-hidden flex flex-col h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-gray-50 group" style={{backgroundColor: 'var(--card-bg)'}}>
                {/* Blog Image */}
                <div className="relative h-56 rounded-2xl overflow-hidden mb-5">
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-gray-900 shadow-sm uppercase tracking-wide">
                        {post.category}
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-[#8b5cf6] transition-colors">
                        {post.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 flex-grow line-clamp-3 leading-relaxed">
                        {post.excerpt}
                    </p>

                    {/* Footer info */}
                    <div className="mt-auto">
                        {/* Author/Date Row - Matching reference style somewhat, but user requested specific Author details too */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-medium text-gray-400">{post.date}</span>
                            <span className="text-xs font-medium text-gray-300">•</span>
                            <span className="text-xs font-medium text-gray-400">{post.readTime}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default BlogCard;
