import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Star, Clock, Users, BookOpen, CheckCircle,
    MonitorPlay, ShieldCheck, Heart, Share2,
    ChevronDown, ChevronUp, Lock, PlayCircle, Globe, Award
} from 'lucide-react';
import { publicCourses } from '../data/publicCoursesMock';
import { courses as homeCourses } from '../data/courses';
import { useUser } from '../context/UserContext';

const PublicCourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Find course in publicCourses first, then fallback to homeCourses
    let course = publicCourses.find(c => String(c.id) === String(courseId));

    // If not found in primary detail mock, try secondary home mock and map fields
    if (!course) {
        const homeCourse = homeCourses.find(c => String(c.id) === String(courseId));
        if (homeCourse) {
            course = {
                ...homeCourse,
                subtitle: `Master the fundamentals of ${homeCourse.category} with this comprehensive course.`,
                thumbnail: homeCourse.image,
                enrolled: homeCourse.students,
                reviewsCount: Math.floor(homeCourse.students / 10),
                level: "All Levels",
                description: homeCourse.title + " is designed for students looking to gain practical skills in " + homeCourse.category + ". You will learn through hands-on projects and expert guidance.",
                whatYouWillLearn: [
                    "Core principles of " + homeCourse.category,
                    "Practical techniques and workflows",
                    "Industry best practices",
                    "Building a real-world project"
                ],
                instructor: {
                    ...homeCourse.instructor,
                    role: "Expert Instructor",
                    bio: homeCourse.instructor.name + " is a specialist in " + homeCourse.category + " with years of industry experience.",
                    students: homeCourse.students + "+",
                    courses: 5
                },
                curriculum: [
                    {
                        title: "Introduction",
                        duration: homeCourse.duration,
                        lessons: [
                            { title: "Course Overview", duration: "10:00", isFree: true },
                            { title: "Getting Started", duration: "15:00", isFree: false }
                        ]
                    }
                ],
                reviews: []
            };
        }
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
        if (!isLoggedIn) {
            // Redirect to login
            navigate('/login');
        } else {
            alert("Enrollment successful (mock)!");
        }
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
                            <div className="flex items-center gap-2">
                                <div className="flex text-yellow-500">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={18} fill={i < Math.floor(course.rating) ? "currentColor" : "none"} className={i >= Math.floor(course.rating) ? "text-gray-600" : ""} />
                                    ))}
                                </div>
                                <span className="text-white font-bold">{course.rating}</span>
                                <span className="text-gray-500">({course.reviewsCount} reviews)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users size={18} className="text-[#8b5cf6]" />
                                <span>{course.enrolled.toLocaleString()} Students Enrolled</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={18} className="text-[#8b5cf6]" />
                                <span>Updated Last month</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mt-8 pt-8 border-t border-gray-800 w-max">
                            <img
                                src={course.instructor.avatar}
                                alt={course.instructor.name}
                                className="w-12 h-12 rounded-full border-2 border-[#8b5cf6]"
                            />
                            <div>
                                <p className="text-gray-400 text-xs uppercase tracking-wider font-bold">Created by</p>
                                <p className="text-white font-bold text-lg">{course.instructor.name}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Student Reviews</h3>
                            <div className="grid gap-6">
                                {course.reviews.length > 0 ? (
                                    course.reviews.map(review => (
                                        <div key={review.id} className="p-6 bg-gray-50 rounded-2xl">
                                            <div className="flex items-center gap-4 mb-4">
                                                <img src={review.avatar} alt={review.user} className="w-10 h-10 rounded-full" />
                                                <div>
                                                    <p className="font-bold text-gray-900">{review.user}</p>
                                                    <div className="flex text-yellow-500 text-xs">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-gray-300" : ""} />
                                                        ))}
                                                        <span className="text-gray-400 ml-2">{review.date}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-gray-600 italic">"{review.comment}"</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">No reviews yet.</p>
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
                                    className="w-full py-4 bg-[#8b5cf6] text-white rounded-xl font-bold text-lg hover:bg-[#7c3aed] transition-all shadow-lg shadow-purple-500/20 active:scale-95 mb-4"
                                >
                                    Enroll Now
                                </button>

                                <button className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 mb-6">
                                    <Heart size={18} /> Add to Wishlist
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
                                            <BookOpen size={18} className="text-[#8b5cf6]" />
                                            <span>Access on mobile and TV</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <Award size={18} className="text-[#8b5cf6]" />
                                            <span>Assignments & Quizzes</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                                    <button className="text-gray-500 text-sm font-bold flex items-center justify-center gap-2 mx-auto hover:text-gray-900">
                                        <Share2 size={16} /> Share this course
                                    </button>
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
                        <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group cursor-pointer">
                            <div className="flex items-center gap-3">
                                <PlayCircle size={16} className={`text-gray-400 group-hover:text-[#8b5cf6] transition-colors`} />
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
