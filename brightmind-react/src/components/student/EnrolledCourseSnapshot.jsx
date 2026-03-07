import React from 'react';
import { PlayCircle, ArrowRight, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EnrolledCourseSnapshot = ({ courses }) => {
    const navigate = useNavigate();

    // Take only the first 3 courses
    const displayCourses = courses.slice(0, 3);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">My Courses</h2>
                <button
                    onClick={() => navigate('/student/courses')}
                    className="text-[#8b5cf6] text-sm font-bold hover:underline"
                >
                    See all
                </button>
            </div>

            <div className="space-y-6">
                {displayCourses.map((course) => (
                    <div
                        key={course.id}
                        className="group cursor-pointer"
                        onClick={() => navigate(`/student/course/${course.id}/watch`)}
                    >
                        <div className="flex gap-4">
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                                <img
                                    src={course.thumbnail}
                                    alt={course.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                    <PlayCircle className="text-white opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100" size={24} />
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-[#8b5cf6] transition-colors">
                                        {course.title}
                                    </h3>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreVertical size={16} />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mb-3">{course.instructor}</p>

                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium text-gray-700">{course.progress}% Complete</span>
                                        <span className="text-gray-400">{course.completedLessons}/{course.totalLessons}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#8b5cf6] rounded-full transition-all duration-500"
                                            style={{ width: `${course.progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={() => navigate('/student/courses')}
                className="w-full mt-6 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
            >
                Continue Learning <ArrowRight size={16} />
            </button>
        </div>
    );
};

export default EnrolledCourseSnapshot;
