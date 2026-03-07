import React from 'react';
import { ArrowUp, Check, BadgeCheck } from 'lucide-react';

const ReplyCard = ({ reply }) => {
    return (
        <div className={`p-6 rounded-2xl border ${reply.isAccepted ? 'bg-green-50/50 border-green-200 shadow-sm' : 'bg-white border-gray-100'}`}>
            <div className="flex gap-4">
                <div className="flex flex-col items-center gap-2">
                    <img
                        src={reply.author.avatar}
                        alt={reply.author.name}
                        className="w-10 h-10 rounded-full border border-gray-200"
                    />
                    {reply.isAccepted && (
                        <div className="flex flex-col items-center text-green-600 mt-2">
                            <Check size={24} />
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{reply.author.name}</span>
                                {reply.author.role === 'Mentor' && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                                        <BadgeCheck size={12} fill="currentColor" className="text-blue-500" /> Mentor
                                    </span>
                                )}
                                <span className="text-gray-400 text-xs">• {reply.createdAt}</span>
                            </div>
                        </div>
                    </div>

                    <div className="prose prose-sm max-w-none text-gray-600 mb-4">
                        <p>{reply.content}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1.5 text-gray-500 hover:text-[#8b5cf6] font-bold text-xs transition-colors">
                            <ArrowUp size={16} />
                            <span>{reply.upvotes} Upvotes</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReplyCard;
