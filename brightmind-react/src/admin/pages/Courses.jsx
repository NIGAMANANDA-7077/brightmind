import React, { useState } from 'react';
import { useAdminCourses } from '../context/AdminCourseContext';
import { Search, Plus, Upload, Filter, MoreVertical, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

const Courses = () => {
    const { courses, deleteCourse, togglePublishStatus } = useAdminCourses();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Filter Logic
    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || course.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
                    <p className="text-gray-500">Manage your course content and catalog</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/admin/courses/create"
                        className="flex items-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-purple-500/20"
                    >
                        <Plus size={20} />
                        Create Course
                    </Link>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <select
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 text-gray-600 cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                    </select>
                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg border border-gray-200">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Course List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                    <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
                        {/* Thumbnail */}
                        <div className="relative h-48 bg-gray-100 overflow-hidden">
                            <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 right-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md ${course.status === 'Published'
                                    ? 'bg-green-500/90 text-white'
                                    : 'bg-gray-500/90 text-white'
                                    }`}>
                                    {course.status}
                                </span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-[#8b5cf6] uppercase tracking-wide">{course.category}</span>
                                <span className="text-xs text-gray-500 font-medium">{course.level}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 mt-auto">
                                <span>{course.students} Students</span>
                                <span>•</span>
                                <span>₹{course.price}</span>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => togglePublishStatus(course.id)}
                                        className="p-2 text-gray-400 hover:text-[#8b5cf6] hover:bg-purple-50 rounded-lg transition-colors"
                                        title={course.status === 'Published' ? 'Unpublish' : 'Publish'}
                                    >
                                        {course.status === 'Published' ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                    <Link
                                        to={`/admin/courses/edit/${course.id}`}
                                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit size={18} />
                                    </Link>
                                </div>
                                <span className="text-xs text-gray-400">Updated {course.lastUpdated}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {filteredCourses.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-gray-300" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No courses found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Courses;
