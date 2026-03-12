import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, Clock } from 'lucide-react';
import ProgressBar from './ProgressBar';

const CourseCard = ({ course }) => {
    const navigate = useNavigate();
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1 group">
            {/* Thumbnail */}
            <div className="relative h-40 overflow-hidden">
                <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                {course.progress > 0 && course.progress < 100 && (
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#8b5cf6] flex items-center gap-1">
                        <PlayCircle size={14} /> Continue
                    </div>
                )}
            </div>

            <div className="p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{course.title}</h3>
                <div className="flex items-center gap-2 mb-4">
                    {course.instructorAvatar && (
                        <img src={course.instructorAvatar} alt={course.instructor} className="w-5 h-5 rounded-full border border-gray-100 object-cover" />
                    )}
                    <p className="text-gray-500 text-xs font-medium">By {course.instructor}</p>
                </div>

                <div className="mb-4">
                    <div className="flex justify-between text-xs font-bold text-gray-600 mb-2">
                        <span>{course.progress}% Completed</span>
                        <span>{course.completedLessons}/{course.totalLessons} Lessons</span>
                    </div>
                    <ProgressBar progress={course.progress} />
                </div>

                <button
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${course.progress === 100
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed] shadow-lg shadow-purple-500/20'
                        }`}
                    onClick={() => {
                        navigate(`/student/course/${course.id}/watch`);
                    }}
                >
                    {course.progress === 100 ? 'Review Course' : 'Continue Learning'}
                </button>
            </div>
        </div>
    );
};

export default CourseCard;
