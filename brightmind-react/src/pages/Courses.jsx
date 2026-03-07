import React, { useState } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import { publicCourses } from '../data/publicCoursesMock';
import PublicCourseCard from '../components/public/PublicCourseCard';
import CTASection from '../components/CTASection';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const Courses = () => {
    const [headerRef, headerVisible] = useScrollAnimation({ threshold: 0.1, once: true });

    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedLevel, setSelectedLevel] = useState('All');

    const categories = ['All', 'Design', 'Development', 'Marketing', 'Data Science'];
    const levels = ['All', 'Beginner', 'Intermediate'];

    // Filter Logic
    const filteredCourses = publicCourses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
        const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;

        return matchesSearch && matchesCategory && matchesLevel;
    });

    return (
        <div className="pt-20">
            {/* Page Header */}
            <section className="py-20 bg-gray-50 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#8b5cf6]/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                <div
                    ref={headerRef}
                    className={`container-custom relative z-10 transition-all duration-1000 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                >
                    <span className="inline-block px-4 py-1.5 bg-purple-100 text-[#8b5cf6] font-bold text-xs uppercase tracking-widest rounded-full mb-6">
                        Unlock Your Potential
                    </span>
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
                        Explore Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-blue-500">Premium Courses</span>
                    </h1>
                    <p className="text-gray-500 text-xl max-w-2xl mx-auto leading-relaxed">
                        Master in-demand skills in Design, Development, Marketing, and more with our expert-led curriculum.
                    </p>
                </div>
            </section>

            {/* Filter & Grid Section */}
            <section className="py-20 bg-white min-h-screen">
                <div className="container-custom">
                    {/* Filters Toolbar */}
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-12 bg-white sticky top-20 z-20 md:static p-4 md:p-0 rounded-2xl shadow-lg md:shadow-none border border-gray-100 md:border-none">
                        <div className="relative w-full lg:w-96">
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search for courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#8b5cf6] focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar w-full md:w-auto">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${selectedCategory === cat
                                                ? 'bg-[#8b5cf6] text-white shadow-lg shadow-purple-500/25'
                                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div className="h-8 w-[1px] bg-gray-200 hidden lg:block"></div>

                            <select
                                value={selectedLevel}
                                onChange={(e) => setSelectedLevel(e.target.value)}
                                className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none focus:border-[#8b5cf6] cursor-pointer"
                            >
                                <option value="All">All Levels</option>
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                    </div>

                    {/* Results Grid */}
                    {filteredCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredCourses.map((course) => (
                                <PublicCourseCard key={course.id} course={course} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No courses found</h3>
                            <p className="text-gray-500">
                                Try adjusting your search or filters to find what you're looking for.
                            </p>
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedLevel('All'); }}
                                className="mt-6 text-[#8b5cf6] font-bold hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <CTASection />
        </div>
    );
};

export default Courses;
