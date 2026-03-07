import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Clock, Users, Star, BookOpen, PlayCircle,
    CheckCircle, Lock, MonitorPlay, ArrowLeft, ShieldCheck
} from 'lucide-react';
import { mockCourses } from '../../data/mockCourses';
import api from '../../utils/axiosConfig';
import { useCourse } from '../../context/CourseContext';

const ExploreCourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const course = mockCourses.find(c => c.id === courseId);

    const { refreshCourses } = useCourse();

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

    const handleEnroll = async () => {
        try {
            const res = await api.post(`/enrollments/${course.id}`);
            if (res.data.success) {
                // Refresh the global course context to pull new specific progress
                if (refreshCourses) await refreshCourses();
                navigate(`/student/courses`);
            }
        } catch (err) {
            console.error('Enrollment Failed', err);
            alert(err.response?.data?.message || 'Failed to enroll');
        }
    };

    return (
        <div className="pb-20 space-y-8 animate-fade-in">
            {/* Back Navigation */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
            >
                <ArrowLeft size={20} /> Back to Browse
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative items-start">
                {/* Left Column: Course Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Header Card */}
                    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="relative z-10">
                            <span className="px-3 py-1 bg-purple-50 text-[#8b5cf6] text-xs font-bold uppercase tracking-wider rounded-full mb-4 inline-block">
                                Premium Course
                            </span>

                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                                {course.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-500 mb-8">
                                <div className="flex items-center gap-2 text-yellow-500 bg-yellow-50 px-3 py-1 rounded-lg">
                                    <Star size={18} fill="currentColor" />
                                    <span className="font-bold text-gray-900">{course.rating}</span>
                                    <span className="text-gray-400">Rating</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users size={18} className="text-gray-400" />
                                    <span>{course.students.toLocaleString()} Students</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={18} className="text-gray-400" />
                                    <span>{course.duration}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BookOpen size={18} className="text-gray-400" />
                                    <span>{course.totalLessons} Lessons</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                                <img
                                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
                                    alt={course.instructor}
                                    className="w-14 h-14 rounded-full object-cover border-4 border-white shadow-md"
                                />
                                <div>
                                    <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Instructor</p>
                                    <p className="font-bold text-gray-900 text-lg">{course.instructor}</p>
                                    <p className="text-sm text-[#8b5cf6] font-medium">{course.role}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* About Course */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-2xl font-bold text-gray-900">About This Course</h3>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            {course.description}
                        </p>

                        <div className="bg-gray-50 rounded-2xl p-6">
                            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <CheckCircle size={20} className="text-green-500" />
                                What you'll learn
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {course.whatYouWillLearn?.map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0"></div>
                                        <span className="text-gray-600 text-sm font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Syllabus Preview */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Course Syllabus</h3>
                        <div className="space-y-4">
                            {course.modules.map((module, index) => (
                                <div key={module.id} className="border border-gray-100 rounded-2xl overflow-hidden">
                                    <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex items-center justify-between">
                                        <h4 className="font-bold text-gray-900">Module {index + 1}: {module.title}</h4>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            {module.lessons.length} Lessons
                                        </span>
                                    </div>
                                    <div className="divide-y divide-gray-50">
                                        {module.lessons.map(lesson => (
                                            <div
                                                key={lesson.id}
                                                className="p-4 flex items-center justify-between opacity-70 hover:opacity-100 transition-opacity bg-white"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                        <Lock size={14} />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-600">
                                                        {lesson.title}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-400">{lesson.duration}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Enrollment Card */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-purple-500/5 overflow-hidden relative">
                            {/* Decor */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                            <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full h-48 object-cover rounded-2xl mb-6 shadow-sm"
                            />

                            <div className="flex items-end gap-2 mb-6">
                                <span className="text-4xl font-black text-gray-900">₹{course.price}</span>
                                <span className="text-gray-400 font-bold mb-1 line-through text-sm">₹{Math.round(course.price * 1.5)}</span>
                            </div>

                            <button
                                onClick={handleEnroll}
                                className="w-full py-4 bg-[#8b5cf6] text-white rounded-xl font-bold text-lg hover:bg-[#7c3aed] transition-all shadow-lg shadow-purple-500/20 active:scale-95 mb-4"
                            >
                                Enroll Now
                            </button>

                            <p className="text-center text-xs text-gray-400 mb-6">30-Day Money-Back Guarantee</p>

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
