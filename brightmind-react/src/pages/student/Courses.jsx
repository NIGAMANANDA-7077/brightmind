import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Compass, Sparkles, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import CourseCard from '../../components/student/CourseCard';
import ExploreCourseCard from '../../components/student/ExploreCourseCard';
import { useCourse } from '../../context/CourseContext';
import api from '../../utils/axiosConfig';

const Courses = () => {
    const { courses: enrolledCourses, loading: enrolledLoading } = useCourse();
    const [allCourses, setAllCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchAllCourses = async () => {
            try {
                const res = await api.get('/courses');
                setAllCourses(res.data);
            } catch (err) {
                console.error("Failed to fetch all courses:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllCourses();
    }, []);

    const filters = ['All', 'In Progress', 'Completed'];

    const filteredCourses = enrolledCourses.filter(c => {
        const status = c.status || (c.progress === 100 ? 'Completed' : 'In Progress');
        const matchesFilter = filter === 'All' || status === filter;
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Get recommended courses (not enrolled yet)
    const enrolledIds = enrolledCourses.map(c => c.id);
    const recommendations = allCourses
        .filter(c => !enrolledIds.includes(c.id))
        .slice(0, 3);

    const handleExplore = () => {
        const exploreSection = document.getElementById('explore-section');
        if (exploreSection) {
            exploreSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    if (enrolledLoading || loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin text-[#8b5cf6]" size={40} /></div>;

    return (
        <div className="space-y-12 pb-20">
            {/* Page Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Courses</h1>
                    <p className="text-gray-500 mt-1">Manage your learning journey and progress</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative w-full sm:w-64">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search your courses..."
                            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-[#8b5cf6] outline-none text-sm w-full transition-all"
                        />
                    </div>
                    <button
                        onClick={handleExplore}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#8b5cf6] text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 hover:bg-[#7c3aed] transition-all hover:scale-[1.02]"
                    >
                        <Plus size={18} /> Explore New Courses
                    </button>
                    <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-[#8b5cf6] transition-colors hidden sm:block">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* My Courses Content */}
            <div className="space-y-6">
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                    {filters.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${filter === f
                                ? 'bg-[#8b5cf6] text-white shadow-lg shadow-purple-500/20'
                                : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map(course => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>

                {filteredCourses.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <Compass className="mx-auto text-gray-300 mb-4" size={48} />
                        <p className="text-gray-500 font-medium">No courses found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* Explore Section */}
            <div id="explore-section" className="pt-8 border-t border-gray-100 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-[#8b5cf6] mb-1">
                            <TrendingUp size={18} />
                            <span className="text-xs font-black uppercase tracking-widest">Growth Opportunities</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
                        <p className="text-gray-500 mt-1">Courses you might be interested in</p>
                    </div>
                    <button className="text-sm font-bold text-[#8b5cf6] hover:underline flex items-center gap-1">
                        View all course catalog <ArrowRight size={16} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recommendations.map(course => (
                        <ExploreCourseCard key={course.id} course={course} />
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                    <div className="text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 mb-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                            <Sparkles size={18} className="text-yellow-400" />
                            <span className="text-xs font-bold uppercase tracking-widest text-white">Unlock Your Potential</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">Master New Skills and<br /><span className="text-[#8b5cf6]">Advance Your Career</span></h2>
                        <p className="text-gray-400 max-w-xl text-lg mb-0 text-balance">Join thousands of students and transform your future with our expert-led courses.</p>
                    </div>
                    <button
                        onClick={handleExplore}
                        className="px-10 py-5 bg-[#8b5cf6] text-white font-black rounded-2xl shadow-xl hover:bg-[#7c3aed] transition-all hover:scale-105 active:scale-95 text-lg whitespace-nowrap"
                    >
                        Browse All Catalog
                    </button>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#8b5cf6]/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px]"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[60px]"></div>
            </div>
        </div>
    );
};

export default Courses;
