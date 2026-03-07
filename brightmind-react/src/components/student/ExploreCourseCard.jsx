import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Users, Clock, ArrowRight } from 'lucide-react';

const ExploreCourseCard = ({ course }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group flex flex-col h-full">
            {/* Thumbnail */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                <div className="absolute top-4 left-4 bg-[#8b5cf6] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                    {course.category}
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold">{course.rating}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg">
                        <Users size={14} />
                        <span className="text-sm font-bold">{course.students}</span>
                    </div>
                </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                    {/* <img src={course.instructor.avatar} alt={course.instructor.name} className="w-6 h-6 rounded-full border border-gray-100" /> */}
                    <span className="text-xs font-medium text-gray-500">{course.instructor}</span>
                </div>

                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-[#8b5cf6] transition-colors">
                    {course.title}
                </h3>

                <div className="flex items-center gap-4 mt-auto pt-4 text-xs font-bold text-gray-400 border-t border-gray-50">
                    <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {course.duration}
                    </div>
                    <div>{course.totalLessons} Lessons</div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                    <div>
                        <span className="text-2xl font-black text-gray-900">₹{course.price}</span>
                        {course.price > 2000 && (
                            <span className="ml-2 text-sm font-medium text-gray-400 line-through">₹{Math.round(course.price * 1.5)}</span>
                        )}
                    </div>
                    <Link to={`/student/explore/${course.id}`} className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-[#8b5cf6] transition-all group-hover:shadow-lg group-hover:shadow-purple-500/20 active:scale-95">
                        Enroll <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ExploreCourseCard;
