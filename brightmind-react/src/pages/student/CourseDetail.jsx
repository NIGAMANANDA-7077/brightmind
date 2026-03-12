import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Clock, Users, Star, Award, BookOpen, PlayCircle,
    CheckCircle, Lock, Download, ArrowLeft, FileText, BarChart
} from 'lucide-react';
import { useCourse } from '../../context/CourseContext';

const CourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { getCourse, getProgress, getCompletedLessonsCount } = useCourse();

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const course = getCourse(courseId);

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <h2 className="text-xl font-bold text-gray-900">Course not found</h2>
                <button
                    onClick={() => navigate('/student/courses')}
                    className="mt-4 text-[#8b5cf6] hover:underline"
                >
                    Back to Courses
                </button>
            </div>
        );
    }

    const progress = getProgress(course.id);
    const completedCount = getCompletedLessonsCount(course.id);
    const totalLessons = course.totalLessons;
    const isCompleted = progress === 100;

    const handleContinue = () => {
        navigate(`/student/course/${course.id}/watch`);
    };

    return (
        <div className="pb-20 space-y-8">
            {/* Back Button */}
            <button
                onClick={() => navigate('/student/courses')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
            >
                <ArrowLeft size={20} /> Back to Courses
            </button>

            {/* Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Course Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1 bg-purple-50 text-[#8b5cf6] text-xs font-bold uppercase tracking-wider rounded-full">
                                    Software Development
                                </span>
                                <div className="flex items-center gap-4 animate-fade-in-up delay-300">
                                    <button
                                        onClick={() => navigate(`/student/forum/course/${course.id}`)}
                                        className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all"
                                    >
                                        <Users size={20} />
                                        Discuss
                                    </button>
                                    <div className="flex items-center gap-1 text-yellow-400">
                                        <Star size={16} fill="currentColor" />
                                        <span className="text-gray-700 font-bold text-sm">{course.rating}</span>
                                    </div>
                                </div>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                {course.title}
                            </h1>
                            <p className="text-gray-600 text-lg leading-relaxed mb-8">
                                {course.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Users size={18} className="text-gray-400" />
                                    <span>{course.studentsEnrolled || 0} Students</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={18} className="text-gray-400" />
                                    <span>{course.duration || 'Flexible'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BarChart size={18} className="text-gray-400" />
                                    <span>{course.level || 'Beginner'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BookOpen size={18} className="text-gray-400" />
                                    <span>{course.totalLessons || 0} Lessons</span>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={course.instructorAvatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"}
                                        alt={course.instructor}
                                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                                    />
                                    <div>
                                        <p className="text-sm text-gray-500">Instructor</p>
                                        <p className="font-bold text-gray-900">{course.instructor}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Description */}
                    {course.detailedDescription && (
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-4 mb-6">
                            <div className="flex items-center gap-2 text-gray-900 font-bold">
                                <BookOpen size={20} className="text-[#8b5cf6]" />
                                About this Course
                            </div>
                            <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                                {course.detailedDescription}
                            </div>
                        </div>
                    )}

                    {/* Learning Outcomes */}
                    {course.learningOutcomes && (
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-4 mb-6">
                            <div className="flex items-center gap-2 text-gray-900 font-bold">
                                <Award size={20} className="text-[#8b5cf6]" />
                                Learning Outcomes
                            </div>
                            <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap pl-2">
                                {course.learningOutcomes}
                            </div>
                        </div>
                    )}

                    {/* Syllabus Section */}
                    {course.syllabusText && (
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6 mb-6">
                            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                                <div className="flex items-center gap-2 text-gray-900 font-bold">
                                    <FileText size={20} className="text-[#8b5cf6]" />
                                    Course Syllabus
                                </div>
                                {course.syllabusUrl && (
                                    <a
                                        href={course.syllabusUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-[#8b5cf6] text-sm font-bold hover:underline"
                                    >
                                        <Download size={16} /> Download PDF
                                    </a>
                                )}
                            </div>
                            <div className="text-gray-600 text-sm leading-relaxed font-mono bg-gray-50 p-6 rounded-2xl whitespace-pre-wrap border border-gray-100">
                                {course.syllabusText}
                            </div>
                        </div>
                    )}

                    {/* Progress Panel */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Course Content</h3>
                            <div className="flex items-center gap-2">
                                {course.instructorAvatar && (
                                    <img src={course.instructorAvatar} alt={course.instructor} className="w-6 h-6 rounded-full border border-gray-100 object-cover" />
                                )}
                                <span className="text-xs font-medium text-gray-500">{course.instructor}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-500">
                                {completedCount}/{totalLessons} Lessons Completed
                            </span>
                        </div>

                        <div className="space-y-6">
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
                                                className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${lesson.isCompleted ? 'bg-purple-50/10' : ''
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {lesson.isCompleted ? (
                                                        <CheckCircle size={20} className="text-green-500" fill="currentColor" />
                                                    ) : (
                                                        <PlayCircle size={20} className="text-gray-300" />
                                                    )}
                                                    <span className={`text-sm font-medium ${lesson.isCompleted ? 'text-gray-900' : 'text-gray-600'}`}>
                                                        {lesson.title}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs text-gray-400">{lesson.duration}</span>
                                                    {lesson.isCompleted && <span className="text-xs font-bold text-green-600">Completed</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: CTA & Stats */}
                <div className="space-y-6">
                    {/* Progress Card */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-24">
                        <div className="mb-6">
                            <div className="flex items-end justify-between mb-2">
                                <span className="text-sm font-bold text-gray-500">Your Progress</span>
                                <span className="text-2xl font-black text-[#8b5cf6]">{progress}%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#8b5cf6] rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleContinue}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isCompleted
                                ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20 active:scale-95'
                                : 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed] shadow-lg shadow-purple-500/20 active:scale-95'
                                }`}
                        >
                            {isCompleted ? (
                                <>
                                    <PlayCircle size={20} /> Review Course
                                </>
                            ) : (
                                <>
                                    <PlayCircle size={20} /> {progress > 0 ? 'Continue Learning' : 'Start Course'}
                                </>
                            )}
                        </button>

                        {!isCompleted && (
                            <p className="text-center text-xs text-gray-400 mt-3">
                                Resume from your last valid session
                            </p>
                        )}

                        <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
                            {course.syllabusUrl ? (
                                <a
                                    href={course.syllabusUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Download size={18} /> Download Resources
                                </a>
                            ) : (
                                <button
                                    disabled
                                    className="w-full py-2.5 rounded-xl border border-gray-100 text-gray-300 font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Download size={18} /> No Resources Available
                                </button>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100">
                            {isCompleted ? (
                                <button
                                    onClick={() => navigate('/student/certificates')}
                                    className="w-full flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100 hover:bg-green-100 transition-colors group cursor-pointer"
                                >
                                    <div className="p-2 bg-white rounded-lg text-green-500 shadow-sm">
                                        <Award size={20} />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="text-xs font-bold text-green-600 uppercase">Certificate Unlocked!</p>
                                        <p className="text-xs text-green-700">Click to view your certificate</p>
                                    </div>
                                    <CheckCircle size={20} className="text-green-500" />
                                </button>
                            ) : (
                                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                                    <div className="p-2 bg-white rounded-lg text-[#8b5cf6]">
                                        <Award size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-[#8b5cf6] uppercase">Certificate</p>
                                        <p className="text-xs text-purple-700">
                                            Complete {totalLessons - completedCount} more lesson{totalLessons - completedCount !== 1 ? 's' : ''} to unlock
                                        </p>
                                    </div>
                                    <Lock size={16} className="text-purple-300" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
