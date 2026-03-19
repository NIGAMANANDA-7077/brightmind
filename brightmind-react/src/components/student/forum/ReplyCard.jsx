import React, { useState } from 'react';
import { ArrowUp, Check, BadgeCheck, Trash2, Award } from 'lucide-react';
import { useUser } from '../../../context/UserContext';
import { useForum } from '../../../context/ForumContext';

const ReplyCard = ({ reply, threadId, onDelete, onAccept }) => {
    const { user } = useUser();
    const { upvoteComment } = useForum();
    const [localUpvotes, setLocalUpvotes] = useState(reply.upvotes || 0);
    const [upvoted, setUpvoted] = useState(false);

    const isTeacherOrAdmin = user?.role === 'Teacher' || user?.role === 'Admin';
    const isAuthor = user?.id === reply.authorId;

    const handleUpvote = async (e) => {
        e.stopPropagation();
        if (upvoted) return;
        const result = await upvoteComment(threadId, reply.id);
        if (result.success) {
            setLocalUpvotes(result.upvotes);
            setUpvoted(true);
        }
    };

    return (
        <div className={`p-6 rounded-2xl border transition-all ${reply.isAccepted
            ? 'bg-green-50/60 border-green-200 shadow-sm shadow-green-100'
            : 'bg-white border-gray-100 hover:border-gray-200'}`}
        >
            {/* Best Answer Banner */}
            {reply.isAccepted && (
                <div className="flex items-center gap-2 mb-4 text-green-700 bg-green-100 px-4 py-2 rounded-xl text-sm font-bold">
                    <Award size={16} fill="currentColor" />
                    Best Answer
                </div>
            )}

            <div className="flex gap-4">
                {/* Left: Avatar + accepted indicator */}
                <div className="flex flex-col items-center gap-2">
                    <img
                        src={reply.authorAvatar || reply.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.authorName || 'U')}&background=8b5cf6&color=fff`}
                        alt={reply.authorName}
                        className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                    />
                    {reply.isAccepted && (
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                            <Check size={14} className="text-white" />
                        </div>
                    )}
                </div>

                {/* Right: Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-gray-900">{reply.authorName || reply.author?.name}</span>
                            {(reply.authorRole === 'Teacher' || reply.author?.role === 'Teacher') && (
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                                    <BadgeCheck size={12} fill="currentColor" className="text-blue-500" /> Teacher
                                </span>
                            )}
                            {(reply.authorRole === 'Admin' || reply.author?.role === 'Admin') && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-wider">Admin</span>
                            )}
                            <span className="text-gray-400 text-xs">• {new Date(reply.createdAt).toLocaleDateString()}</span>
                        </div>

                        {/* Teacher / Author moderation */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {isTeacherOrAdmin && !reply.isAccepted && onAccept && (
                                <button
                                    onClick={() => onAccept(reply.id)}
                                    className="flex items-center gap-1 text-xs font-bold text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-2 py-1 rounded-lg transition-colors"
                                    title="Mark as Best Answer"
                                >
                                    <Check size={14} /> Best Answer
                                </button>
                            )}
                            {(isTeacherOrAdmin || isAuthor) && onDelete && (
                                <button
                                    onClick={() => onDelete(reply.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="text-gray-700 text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                        {reply.content}
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleUpvote}
                            disabled={upvoted || isAuthor}
                            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${upvoted
                                ? 'bg-[#8b5cf6]/10 text-[#8b5cf6] cursor-default'
                                : 'bg-gray-50 text-gray-500 hover:bg-[#8b5cf6]/10 hover:text-[#8b5cf6] disabled:opacity-50'}`}
                        >
                            <ArrowUp size={14} />
                            <span>{localUpvotes} {localUpvotes === 1 ? 'Upvote' : 'Upvotes'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReplyCard;
