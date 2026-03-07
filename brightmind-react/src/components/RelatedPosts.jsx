import React from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blog';

const RelatedPosts = ({ currentId }) => {
    // Get 3 posts that are not the current one
    const related = blogPosts
        .filter(post => post.id !== currentId)
        .slice(0, 3);

    return (
        <section className="py-20 bg-[#fbfbfb]">
            <div className="container-custom">
                <h3 className="text-3xl font-bold text-gray-900 mb-10">Related Articles</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {related.map(post => (
                        <Link to={`/blog/${post.slug}`} key={post.id} className="group block">
                            <div className="bg-white rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                                <div className="h-48 overflow-hidden relative">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-gray-900 shadow-sm uppercase">
                                        {post.category}
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <h4 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-[#8b5cf6] transition-colors line-clamp-2">
                                        {post.title}
                                    </h4>
                                    <div className="mt-auto flex items-center gap-2 text-xs text-gray-400">
                                        <span>{post.date}</span>
                                        <span>•</span>
                                        <span>{post.readTime}</span>
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
