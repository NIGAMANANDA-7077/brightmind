import React from 'react';
import { Star, BookOpen, Clock, GraduationCap } from 'lucide-react';

const CourseCard = ({ course }) => {
    return (
        <div className="group bg-white rounded-3xl p-4 md:p-5 hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100 h-full flex flex-col relative overflow-hidden">
            {/* Course Image */}
            <div className="relative rounded-2xl overflow-hidden mb-5 h-56 md:h-64">
                <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                    <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                    <span className="font-bold text-sm text-gray-900">{course.rating}</span>
                </div>
            </div>

            {/* Course Content */}
            <div className="flex flex-col flex-1">
                <h3 className="font-bold text-xl text-gray-900 mb-4 leading-tight group-hover:text-[#8b5cf6] transition-colors line-clamp-2">
                    {course.title}
                </h3>

                {/* Course Stats */}
                <div className="flex items-center gap-2 mb-6 text-xs text-gray-500 font-medium flex-wrap">
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 bg-white">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{course.lessons} lesson</span>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 bg-white">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 bg-white">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>{course.students} students</span>
                    </div>
                </div>

                {/* Footer: Instructor & Price */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                    {/* Instructor */}
                    <div className="flex items-center gap-3">
                        <img
                            src={course.instructor.avatar}
                            alt={course.instructor.name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="text-sm font-bold text-gray-700">
                            {course.instructor.name}
                        </span>
                    </div>

                    {/* Price */}
                    <div className="font-bold text-xl text-gray-900 group-hover:text-[#8b5cf6] transition-colors">
                        ₹{course.price.toLocaleString('en-IN')}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
