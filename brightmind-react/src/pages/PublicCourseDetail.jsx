import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Star, Clock, Users, BookOpen, CheckCircle,
    MonitorPlay, ShieldCheck, X,
    ChevronDown, ChevronUp, Lock, PlayCircle, Globe, Award
} from 'lucide-react';
import { useUser } from '../context/UserContext';

const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60';

// Normalise backend course to the shape this component expects
function normalise(c) {
    const hasPreview = !!c.youtubeUrl;
    const modules = (c.courseModules || []).map((m, mi) => ({
        title: m.moduleTitle || m.title || 'Module',
        duration: '',
        lessons: (m.lessons || []).map((l, li) => ({
            title: l.lessonTitle || l.title || 'Lesson',
            duration: l.duration || '',
            // First lesson of first module is preview if course has a youtubeUrl
            isFree: hasPreview && mi === 0 && li === 0,
        })),
    }));

    // Build a basic curriculum if no modules exist
    if (modules.length === 0) {
        modules.push({
            title: 'Introduction',
            duration: c.duration || 'Self-paced',
            lessons: [
                { title: 'Course Overview', duration: '10:00', isFree: hasPreview },
                { title: 'Getting Started', duration: '15:00', isFree: false },
            ],
        });
    }

    return {
        id: c.id,
        title: c.title,
        subtitle: c.description || `Master ${c.subject || c.category || 'this subject'} with expert guidance.`,
        description: c.detailedDescription || c.description || `${c.title} is designed for students looking to gain practical skills. Learn through hands-on projects and expert guidance.`,
        category: c.subject || c.category || 'General',
        level: c.level || 'All Levels',
        thumbnail: c.thumbnail || DEFAULT_THUMBNAIL,
        youtubeUrl: c.youtubeUrl || null,
        rating: null,          // never show hardcoded rating
        reviewsCount: 0,
        enrolled: c.studentsEnrolled || 0,
        price: Number(c.price) || 0,
        duration: c.duration || 'Self-paced',
        instructor: {
            name: c.instructor || c.createdByAdminName || 'Instructor',
            avatar: c.instructorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.instructor || c.createdByAdminName || 'Instructor')}&background=8b5cf6&color=fff&size=128`,
            role: 'Expert Instructor',
            bio: `${c.instructor || c.createdByAdminName || 'Instructor'} is an experienced instructor dedicated to delivering quality education.`,
            students: c.studentsEnrolled || 0,
            courses: 1,
        },
        whatYouWillLearn: c.learningOutcomes
            ? c.learningOutcomes.split('\n').filter(Boolean)
            : [
                `Core concepts of ${c.subject || c.title}`,
                'Practical techniques and workflows',
                'Industry best practices',
                'Build real-world projects',
            ],
        curriculum: modules,
        reviews: [],
    };
}

const PublicCourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalRatings: 0 });
    const [previewOpen, setPreviewOpen] = useState(false);

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchCourse = async () => {
            try {
                const res = await fetch(`${API_BASE}/courses/public/${courseId}`);
                if (res.ok) {
                    const data = await res.json();
                    setCourse(data ? normalise(data) : null);
                } else {
                    setCourse(null);
                }
            } catch {
                setCourse(null);
            } finally {
                setLoading(false);
            }
        };

        const fetchReviews = async () => {
            try {
                const res = await fetch(`${API_BASE}/reviews/course/${courseId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setReviews(data.data || []);
                        setReviewStats(data.stats || { averageRating: 0, totalRatings: 0 });
                    }
                }
            } catch {
                // silently fail — reviews are optional
            }
        };

        fetchCourse();
        fetchReviews();
    }, [courseId]);

    if (loading) {
        return (
            <div className="min-h-screen pt-20 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#8b5cf6] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500">Loading course details...</p>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen pt-20 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
                <Link to="/courses" className="text-[#8b5cf6] font-bold hover:underline">
                    Back to Courses
                </Link>
            </div>
        );
    }

    const isLoggedIn = !!user;
    const handleEnroll = () => {
        navigate('/contact');
    };

    return (
        <div className="pt-20 pb-20 animate-fade-in">
            {/* Hero Section */}
            <div className="bg-[#111827] text-white pt-12 pb-20 md:pb-32 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#8b5cf6]/20 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                <div className="container-custom relative z-10">
                    <div className="max-w-4xl">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 bg-[#8b5cf6]/20 text-[#a78bfa] border border-[#8b5cf6]/30 rounded-full text-xs font-bold uppercase tracking-wider">
                                {course.category}
                            </span>
                            <span className="flex items-center gap-1 text-gray-400 text-sm font-medium">
                                <Globe size={14} /> {course.level}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                            {course.title}
                        </h1>

                        <p className="text-xl text-gray-400 mb-8 max-w-2xl leading-relaxed">
                            {course.subtitle}
                        </p>

                        <div className="flex flex-wrap items-center gap-8 text-sm font-medium text-gray-300">
                            {reviewStats.totalRatings > 0 && (
                                <div className="flex items-center gap-2">
                                    <div className="flex text-yellow-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={16} fill={i < Math.floor(reviewStats.averageRating) ? "currentColor" : "none"} className={i >= Math.floor(reviewStats.averageRating) ? "text-gray-600" : ""} />
                                        ))}
                                    </div>
                                    <span className="text-white font-bold">{reviewStats.averageRating}</span>
                                    <span className="text-gray-500">({reviewStats.totalRatings} reviews)</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Users size={16} className="text-[#8b5cf6]" />
                                <span>{course.enrolled.toLocaleString()} Students Enrolled</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-[#8b5cf6]" />
                                <span>Duration: {course.duration}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Video Modal */}
            {previewOpen && course.youtubeUrl && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewOpen(false)}>
                    <div className="relative w-full max-w-3xl bg-black rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setPreviewOpen(false)}
                            className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                        <div className="aspect-video">
                            <iframe
                                src={course.youtubeUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title="Course Preview"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="container-custom relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 -mt-10 md:-mt-20">
                    {/* Left Column: Content */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* About Course */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">About This Course</h3>
                            <p className="text-gray-600 leading-relaxed text-lg mb-8">
                                {course.description}
                            </p>

                            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                                <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <CheckCircle size={20} className="text-green-500" />
                                    What you'll learn
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {course.whatYouWillLearn.map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0"></div>
                                            <span className="text-gray-700 font-medium">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Curriculum */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Course Curriculum</h3>
                            <div className="space-y-4">
                                {course.curriculum.map((module, idx) => (
                                    <ViewModule key={idx} module={module} idx={idx} />
                                ))}
                            </div>
                        </div>

                        {/* Instructor */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Meet Your Instructor</h3>

                            <div className="flex flex-col md:flex-row gap-6">
                                <img
                                    src={course.instructor.avatar}
                                    alt={course.instructor.name}
                                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-50"
                                />
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900">{course.instructor.name}</h4>
                                    <p className="text-[#8b5cf6] font-medium mb-4">{course.instructor.role}</p>

                                    <div className="flex gap-6 mb-4 text-sm font-bold text-gray-600">
                                        <div className="flex items-center gap-1.5">
                                            <Users size={16} className="text-gray-400" />
                                            {course.instructor.students} Students
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <PlayCircle size={16} className="text-gray-400" />
                                            {course.instructor.courses} Courses
                                        </div>
                                    </div>

                                    <p className="text-gray-600 leading-relaxed">
                                        {course.instructor.bio}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Reviews */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">Student Reviews</h3>
                                {reviewStats.totalRatings > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-3xl font-black text-gray-900">{reviewStats.averageRating}</span>
                                        <div className="flex flex-col">
                                            <div className="flex text-yellow-500">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={14} fill={i < Math.round(reviewStats.averageRating) ? "currentColor" : "none"} className={i >= Math.round(reviewStats.averageRating) ? "text-gray-300" : ""} />
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-400 font-medium">{reviewStats.totalRatings} ratings</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="grid gap-6">
                                {reviews.length > 0 ? (
                                    reviews.map(review => (
                                        <div key={review.id} className="p-6 bg-gray-50 rounded-2xl">
                                            <div className="flex items-center gap-4 mb-4">
                                                <img
                                                    src={review.student?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.student?.name || 'Student')}&background=8b5cf6&color=fff&size=64`}
                                                    alt={review.student?.name || 'Student'}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                                <div>
                                                    <p className="font-bold text-gray-900">{review.student?.name || 'Student'}</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex text-yellow-500">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-gray-300" : ""} />
                                                            ))}
                                                        </div>
                                                        <span className="text-gray-400 text-xs">
                                                            {new Date(review.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            {review.comment && (
                                                <p className="text-gray-600 italic">"{review.comment}"</p>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10">
                                        <Star size={40} className="text-gray-200 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">No reviews yet.</p>
                                        <p className="text-gray-400 text-sm">Be the first to review this course!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sticky Pricing Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative">
                                <img
                                    src={course.thumbnail}
                                    alt="thumbnail"
                                    className="w-full h-48 object-cover rounded-2xl mb-6 shadow-sm hidden md:block"
                                />

                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-3xl font-black text-gray-900">₹{course.price.toLocaleString()}</span>
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-full">
                                        50% Off
                                    </span>
                                </div>
                                <p className="text-gray-400 font-medium line-through mb-6">₹{(course.price * 2).toLocaleString()}</p>

                                <button
                                    onClick={handleEnroll}
                                    className="w-full py-4 bg-[#8b5cf6] text-white rounded-xl font-bold text-lg hover:bg-[#7c3aed] transition-all shadow-lg shadow-purple-500/20 active:scale-95 mb-6"
                                >
                                    Enroll Now
                                </button>

                                <div className="space-y-4 pt-6 border-t border-gray-100">
                                    <h5 className="font-bold text-gray-900">This course includes:</h5>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <MonitorPlay size={18} className="text-[#8b5cf6]" />
                                            <span>Full lifetime access</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <ShieldCheck size={18} className="text-[#8b5cf6]" />
                                            <span>Certificate of completion</span>
                                        </div>
            
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <Award size={18} className="text-[#8b5cf6]" />
                                            <span>Assignments & Quizzes</span>
                                        </div>
                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ViewModule = ({ module, idx }) => {
    const [isOpen, setIsOpen] = React.useState(idx === 0);

    return (
        <div className="border border-gray-200 rounded-2xl overflow-hidden transition-all">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-5 bg-gray-50/50 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                        {idx + 1}
                    </div>
                    <div className="text-left">
                        <h4 className="font-bold text-gray-900">{module.title}</h4>
                        <span className="text-xs text-gray-500 font-medium">{module.lessons.length} Lessons • {module.duration}</span>
                    </div>
                </div>
                {isOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </button>

            {isOpen && (
                <div className="divide-y divide-gray-100 bg-white">
                    {module.lessons.map((lesson, i) => (
                        <div
                            key={i}
                            onClick={() => { if (lesson.isFree && course.youtubeUrl) setPreviewOpen(true); }}
                            className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group ${lesson.isFree && course.youtubeUrl ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                            <div className="flex items-center gap-3">
                                <PlayCircle size={16} className={`transition-colors ${lesson.isFree ? 'text-[#8b5cf6]' : 'text-gray-400 group-hover:text-[#8b5cf6]'}`} />
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{lesson.title}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                {lesson.isFree && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                        Preview
                                    </span>
                                )}
                                <span className="text-xs text-gray-400 font-medium">{lesson.duration}</span>
                                {lesson.isFree ? null : <Lock size={14} className="text-gray-300" />}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PublicCourseDetail;
