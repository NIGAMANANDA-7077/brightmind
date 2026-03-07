import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Users, ArrowRight } from 'lucide-react';

const PublicCourseCard = ({ course }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group flex flex-col h-full">
            {/* Thumbnail */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>

                <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-[#8b5cf6] text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                    {course.category}
                </span>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-bold">{course.rating}</span>
                        <span className="text-xs text-white/80">({course.reviewsCount} reviews)</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3">
                    <img src={course.instructor.avatar} alt={course.instructor.name} className="w-6 h-6 rounded-full border border-gray-100 object-cover" />
                    <span className="text-xs font-medium text-gray-500">{course.instructor.name}</span>
                </div>

                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-[#8b5cf6] transition-colors">
                    {course.title}
                </h3>

                <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                    {course.subtitle}
                </p>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                    <div>
                        <span className="text-xl font-black text-gray-900">₹{course.price.toLocaleString()}</span>
                    </div>
                </div>

                <Link
                    to={`/courses/${course.id}`}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#f3f4f6] text-gray-900 rounded-xl text-sm font-bold hover:bg-[#8b5cf6] hover:text-white transition-all group-hover:shadow-lg group-hover:shadow-purple-500/20"
                >
                    View Details <ArrowRight size={16} />
                </Link>
            </div>
        </div>
    );
};

export default PublicCourseCard;
