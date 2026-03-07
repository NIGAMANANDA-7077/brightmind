import React from 'react';
import { Star, MessageCircle, Calendar } from 'lucide-react';

const MentorCard = ({ mentor, onBook }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-md transition-all hover:-translate-y-1">
            <img src={mentor.avatar} alt={mentor.name} className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-gray-50" />

            <h3 className="text-xl font-bold text-gray-900">{mentor.name}</h3>
            <p className="text-sm text-[#8b5cf6] font-medium mb-1">{mentor.role}</p>
            <p className="text-xs text-gray-400 mb-4">{mentor.company}</p>

            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg mb-4">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-bold text-gray-700">{mentor.rating}</span>
                <span className="text-xs text-gray-400">({mentor.reviews} reviews)</span>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-6">
                {mentor.expertise.slice(0, 3).map(skill => (
                    <span key={skill} className="px-2 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold rounded-md uppercase tracking-wide">
                        {skill}
                    </span>
                ))}
            </div>

            <div className="flex gap-2 w-full">
                <button className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <MessageCircle size={16} /> Chat
                </button>
                <button
                    onClick={() => onBook(mentor)}
                    className="flex-1 py-2 rounded-xl bg-[#8b5cf6] text-white font-bold text-sm hover:bg-[#7c3aed] transition-colors shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                >
                    <Calendar size={16} /> Book
                </button>
            </div>
        </div>
    );
};

export default MentorCard;
