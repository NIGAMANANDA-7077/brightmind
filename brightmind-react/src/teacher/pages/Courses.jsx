import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import api from '../../utils/axiosConfig';
import { BookOpen, Users, File, Video, ChevronRight, Upload, Loader2 } from 'lucide-react';

const statusBadge = (status) => (
    <span className={`text-xs font-bold px-3 py-1 rounded-full ${status === 'Active' || status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
        {status}
    </span>
);

const Courses = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCourses = async () => {
        if (!user?.id) return;
        try {
            // First try teacher-specific courses
            const res = await api.get(`/courses/teacher/${user.id}`);
            const teacherCourses = Array.isArray(res.data) ? res.data : res.data?.data || [];
            if (teacherCourses.length > 0) {
                setCourses(teacherCourses);
            } else {
                // Fallback: load all courses so teacher can see available courses
                const allRes = await api.get('/courses');
                setCourses(Array.isArray(allRes.data) ? allRes.data : allRes.data?.data || []);
            }
        } catch (err) {
            console.error("Failed to fetch teacher courses:", err);
            // Fallback to all courses on error
            try {
                const allRes = await api.get('/courses');
                setCourses(Array.isArray(allRes.data) ? allRes.data : allRes.data?.data || []);
            } catch {
                setCourses([]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [user?.id]);

    const activeCount = courses.filter(c => c.status === 'Active' || c.status === 'Published').length;

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#8b5cf6]" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
                    <p className="text-gray-500">{activeCount} active · {courses.length - activeCount} draft · Assigned by Admin</p>
                </div>
                <div className="bg-[#8b5cf6]/10 text-[#8b5cf6] text-sm font-bold px-4 py-2 rounded-xl">
                    {courses.length} Total
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3 text-sm text-blue-700">
                <BookOpen size={18} className="flex-shrink-0 mt-0.5 text-blue-500" />
                <p>Courses assigned to you by the Admin appear here. Click any course to view its syllabus, upload materials, and manage content. Contact Admin to get courses assigned to your account.</p>
            </div>

            {/* Course Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {courses.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <BookOpen size={48} className="mx-auto text-gray-300 mb-4 opacity-20" />
                        <p className="text-gray-500 font-bold">No courses assigned yet</p>
                    </div>
                ) : (
                    courses.map(course => (
                        <div
                            key={course.id}
                            onClick={() => navigate(`/teacher/courses/${course.id}`)}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#8b5cf6]/30 transition-all cursor-pointer group p-5"
                        >
                            {/* Top Row */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-[#8b5cf6]/10 rounded-xl group-hover:bg-[#8b5cf6]/20 transition-colors">
                                        <BookOpen size={20} className="text-[#8b5cf6]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-[#8b5cf6] transition-colors">{course.title}</h3>
                                        <p className="text-xs text-gray-400">{course.subject} · Enrolled: {course.studentsEnrolled || 0}</p>
                                    </div>
                                </div>
                                {statusBadge(course.status)}
                            </div>

                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                <span className="flex items-center gap-1.5">
                                    <Users size={13} className="text-gray-400" />
                                    <span className="font-bold text-gray-700">{course.studentsEnrolled || 0}</span> students
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Upload size={13} className="text-gray-400" />
                                    <span className="font-bold text-gray-700">{(course.materials || []).length}</span> materials
                                </span>
                            </div>

                            {/* Material Preview */}
                            {(course.materials || []).length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {(course.materials || []).slice(0, 3).map((m, i) => (
                                        <span key={i} className="flex items-center gap-1 text-xs bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg text-gray-500">
                                            {typeof m === 'string' && (m.endsWith('.mp4') || m.includes('video')) ? <Video size={11} className="text-blue-500" /> : <File size={11} className="text-orange-500" />}
                                            {typeof m === 'string' ? m.split('/').pop().substring(0, 14) : 'Material'}
                                        </span>
                                    ))}
                                    {(course.materials || []).length > 3 && (
                                        <span className="text-xs bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg text-gray-400">+{(course.materials || []).length - 3} more</span>
                                    )}
                                </div>
                            )}

                            {/* CTA */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                <span className="text-xs text-gray-400">View course details & syllabus</span>
                                <ChevronRight size={18} className="text-gray-300 group-hover:text-[#8b5cf6] group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Courses;
