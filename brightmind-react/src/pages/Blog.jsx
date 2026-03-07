import React, { useState } from 'react';
import { blogPosts } from '../data/blog';
import BlogCard from '../components/BlogCard';
import CTASection from '../components/CTASection';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const Blog = () => {
    const [headerRef, headerVisible] = useScrollAnimation({ threshold: 0.1, once: true });
    const [gridRef, gridVisible] = useScrollAnimation({ threshold: 0.1, once: true });

    // Logic for "Load More"
    const [visiblePosts, setVisiblePosts] = useState(9); // Show 9 initially as per image roughly (3 rows)

    const loadMore = () => {
        setVisiblePosts(prev => prev + 3);
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
                    <div
                        ref={gridRef}
                        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 stagger-children ${gridVisible ? 'visible' : ''}`}
                    >
                        {blogPosts.slice(0, visiblePosts).map((post) => (
                            <div key={post.id}>
                                <BlogCard post={post} />
                            </div>
                        ))}
                    </div>

                    {/* Load More Button */}
                    {visiblePosts < blogPosts.length && (
                        <div className="text-center">
                            <button
                                onClick={loadMore}
                                className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-3.5 rounded-full font-semibold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                            >
                                Load More Articles
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <CTASection />
        </div>
    );
};

export default Blog;
