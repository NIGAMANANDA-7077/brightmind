import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Clock, Users, Star, BookOpen, PlayCircle,
    CheckCircle, Lock, MonitorPlay, ArrowLeft, ShieldCheck, Loader2, Send
} from 'lucide-react';
import api from '../../utils/axiosConfig';
import { useCourse } from '../../context/CourseContext';

const ExploreCourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { courses: enrolledCourses, refreshCourses } = useCourse();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [enrollStatus, setEnrollStatus] = useState(null); // null | 'pending' | 'approved' | 'rejected' | 'enrolled'
    const [requesting, setRequesting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await api.get(`/courses/${courseId}`);
                setCourse(res.data);
            } catch (err) {
                console.error('Failed to fetch course:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);

    useEffect(() => {
        // Check if already enrolled via context first
        const alreadyEnrolled = enrolledCourses.some(c => c.id === courseId);
        if (alreadyEnrolled) {
            setEnrollStatus('enrolled');
            return;
        }
        // Check enrollment request status from API
        const checkStatus = async () => {
            try {
                const res = await api.get(`/enrollment-requests/status/${courseId}`);
                setEnrollStatus(res.data.status);
            } catch (err) {
                // If 403 (not student) or other error, ignore
            }
        };
        checkStatus();
    }, [courseId, enrolledCourses]);

    const handleRequestEnroll = async () => {
        setRequesting(true);
        try {
            await api.post(`/enrollment-requests/${courseId}`);
            setEnrollStatus('pending');
            setSuccessMsg('Enrollment request sent to admin!');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to send request';
            alert(msg);
        } finally {
            setRequesting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-[#8b5cf6]" size={40} />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center p-20 min-h-[60vh]">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
                <button
                    onClick={() => navigate('/student/courses')}
                    className="flex items-center gap-2 text-[#8b5cf6] font-bold hover:underline"
                >
                    <ArrowLeft size={20} /> Back to Browse
                </button>
            </div>
        );
    }

    const renderEnrollButton = () => {
        if (enrollStatus === 'enrolled') {
            return (
                <button
                    onClick={() => navigate(`/student/course/${courseId}`)}
                    className="w-full py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-all shadow-lg active:scale-95 mb-4"
                >
                    ✅ Go to Course
                </button>
            );
        }
        if (enrollStatus === 'pending') {
            return (
                <div className="w-full py-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl font-bold text-center mb-4">
                    ⏳ Request Pending
                    <p className="text-xs font-normal mt-1 text-yellow-500">Admin will review your request</p>
                </div>
            );
        }
        if (enrollStatus === 'rejected') {
            return (
                <div className="w-full py-4 bg-red-50 border border-red-200 text-red-600 rounded-xl font-bold text-center mb-4">
                    ❌ Request Rejected
                    <p className="text-xs font-normal mt-1 text-red-400">Contact admin for more details</p>
                </div>
            );
        }
        return (
            <button
                onClick={handleRequestEnroll}
                disabled={requesting}
                className="w-full py-4 bg-[#8b5cf6] text-white rounded-xl font-bold text-lg hover:bg-[#7c3aed] transition-all shadow-lg shadow-purple-500/20 active:scale-95 mb-4 disabled:opacity-60 flex items-center justify-center gap-2"
            >
                {requesting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                {requesting ? 'Sending...' : 'Request Enrollment'}
            </button>
        );
    };

    const modules = course.courseModules || [];
    const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);

    return (
        <div className="pb-20 space-y-8 animate-fade-in">
            {/* Back Navigation */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
            >
                <ArrowLeft size={20} /> Back to Browse
            </button>

            {successMsg && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl px-6 py-4 font-medium flex items-center gap-2">
                    <CheckCircle size={20} />
                    {successMsg}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative items-start">
                {/* Left Column: Course Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Header Card */}
                    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="relative z-10">
                            <span className="px-3 py-1 bg-purple-50 text-[#8b5cf6] text-xs font-bold uppercase tracking-wider rounded-full mb-4 inline-block">
                                {course.category || course.subject || 'Course'}
                            </span>

                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                                {course.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-500 mb-8">
                                <div className="flex items-center gap-2">
                                    <BookOpen size={18} className="text-gray-400" />
                                    <span>{totalLessons} Lessons</span>
                                </div>
                                {modules.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <PlayCircle size={18} className="text-gray-400" />
                                        <span>{modules.length} Modules</span>
                                    </div>
                                )}
                            </div>

                            {course.instructor && (
                                <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                                    <img
                                        src={course.instructorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor)}&background=8b5cf6&color=fff`}
                                        alt={course.instructor}
                                        className="w-14 h-14 rounded-full object-cover border-4 border-white shadow-md"
                                    />
                                    <div>
                                        <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Instructor</p>
                                        <p className="font-bold text-gray-900 text-lg">{course.instructor}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* About Course */}
                    {course.description && (
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900">About This Course</h3>
                            <p className="text-gray-600 text-lg leading-relaxed">{course.description}</p>
                        </div>
                    )}

                    {/* Syllabus Preview */}
                    {modules.length > 0 && (
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Course Syllabus</h3>
                            <div className="space-y-4">
                                {modules.map((module, index) => (
                                    <div key={module.id} className="border border-gray-100 rounded-2xl overflow-hidden">
                                        <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex items-center justify-between">
                                            <h4 className="font-bold text-gray-900">Module {index + 1}: {module.title}</h4>
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                                {module.lessons?.length || 0} Lessons
                                            </span>
                                        </div>
                                        {module.lessons?.length > 0 && (
                                            <div className="divide-y divide-gray-50">
                                                {module.lessons.map(lesson => (
                                                    <div key={lesson.id} className="p-4 flex items-center justify-between opacity-70 bg-white">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                                <Lock size={14} />
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-600">{lesson.title}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Enrollment Card */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-purple-500/5 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                            {course.thumbnail && (
                                <img
                                    src={course.thumbnail}
                                    alt={course.title}
                                    className="w-full h-48 object-cover rounded-2xl mb-6 shadow-sm"
                                />
                            )}

                            <div className="flex items-end gap-2 mb-6">
                                <span className="text-4xl font-black text-gray-900">
                                    {course.price > 0 ? `₹${course.price}` : 'Free'}
                                </span>
                            </div>

                            {renderEnrollButton()}

                            <div className="space-y-3 pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                                    <MonitorPlay size={18} className="text-[#8b5cf6]" />
                                    <span>Full lifetime access</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                                    <ShieldCheck size={18} className="text-[#8b5cf6]" />
                                    <span>Certificate of completion</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                                    <Users size={18} className="text-[#8b5cf6]" />
                                    <span>Access to community forum</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExploreCourseDetail;

