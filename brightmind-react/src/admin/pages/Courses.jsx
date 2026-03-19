import React, { useState } from 'react';
import { useAdminCourses } from '../context/AdminCourseContext';
import { Search, Plus, Filter, Edit, Eye, EyeOff, Trash2, BookOpen, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Courses = () => {
    const { courses, deleteCourse, togglePublishStatus, loading } = useAdminCourses();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const filteredCourses = courses.filter(course => {
        const matchesSearch =
            (course.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (course.subject || course.category || '').toLowerCase().includes(searchTerm.toLowerCase());
        const courseStatus = course.status === 'Active' ? 'Published' : course.status;
        const matchesStatus = statusFilter === 'All' || courseStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleDelete = async (id) => {
        await deleteCourse(id);
        setDeleteConfirm(null);
    };

    return (
        <div className="space-y-6">
            {/* Delete Confirm Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Course?</h3>
                        <p className="text-gray-500 text-sm mb-6">This will permanently delete "<strong>{deleteConfirm.title}</strong>" and all associated content.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
                    <p className="text-gray-500">Manage your course catalog</p>
                </div>
                <Link
                    to="/admin/courses/create"
                    className="flex items-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 w-fit"
                >
                    <Plus size={20} />
                    Create Course
                </Link>
            </div>

            {/* Filters */}
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
                <select
                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 text-gray-600"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Status</option>
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                </select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total', value: courses.length, color: 'bg-purple-50 text-[#8b5cf6]' },
                    { label: 'Published', value: courses.filter(c => c.status === 'Active' || c.status === 'Published').length, color: 'bg-green-50 text-green-600' },
                    { label: 'Draft', value: courses.filter(c => c.status === 'Draft').length, color: 'bg-yellow-50 text-yellow-600' }
                ].map(s => (
                    <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
                        <p className="text-2xl font-bold">{s.value}</p>
                        <p className="text-xs font-semibold">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Course Grid */}
            {loading ? (
                <div className="text-center py-16 text-gray-400">Loading courses...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => {
                        const isPublished = course.status === 'Active' || course.status === 'Published';
                        return (
                            <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col">
                                {/* Thumbnail */}
                                <div className="relative h-44 bg-gradient-to-br from-purple-100 to-blue-50 overflow-hidden">
                                    {course.thumbnail ? (
                                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BookOpen size={40} className="text-purple-300" />
                                        </div>
                                    )}
                                    <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md ${isPublished ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-white'}`}>
                                        {isPublished ? 'Published' : 'Draft'}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <p className="text-xs font-semibold text-[#8b5cf6] uppercase tracking-wide mb-1">{course.subject || course.category || 'General'}</p>
                                    <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
                                    {course.description && (
                                        <p className="text-xs text-gray-400 line-clamp-2 mb-2">{course.description}</p>
                                    )}
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-auto mb-3">
                                        <span className="flex items-center gap-1"><Users size={12} />{course.studentsEnrolled || 0} Students</span>
                                        <span>•</span>
                                        <span>{course.price > 0 ? `₹${course.price}` : 'Free'}</span>
                                        {course.instructor && <span>•</span>}
                                        {course.instructor && <span className="truncate">{course.instructor}</span>}
                                    </div>

                                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => togglePublishStatus(course.id)}
                                                className="p-2 text-gray-400 hover:text-[#8b5cf6] hover:bg-purple-50 rounded-lg transition-colors"
                                                title={isPublished ? 'Unpublish' : 'Publish'}
                                            >
                                                {isPublished ? <Eye size={16} /> : <EyeOff size={16} />}
                                            </button>
                                            <Link
                                                to={`/admin/courses/edit/${course.id}`}
                                                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </Link>
                                            <button
                                                onClick={() => setDeleteConfirm(course)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {new Date(course.updatedAt || course.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {filteredCourses.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="text-gray-300" size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No courses found</h3>
                            <p className="text-gray-500 mb-4">Try adjusting your search or create a new course.</p>
                            <Link to="/admin/courses/create" className="inline-flex items-center gap-2 bg-[#8b5cf6] text-white px-5 py-2.5 rounded-xl font-bold">
                                <Plus size={18} /> Create Course
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Courses;
