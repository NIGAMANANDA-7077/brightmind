import React from 'react';
import { MessageSquare, ArrowUp, Eye, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForum } from '../../../context/ForumContext';

const ThreadCard = ({ thread }) => {
    const navigate = useNavigate();
    const { upvoteThread } = useForum();

    const handleVote = async (e) => {
        e.stopPropagation();
        const result = await upvoteThread(thread.id);
        if (!result.success && result.message.includes('already upvoted')) {
            alert("You have already upvoted this discussion!");
        }
    };

    return (
        <div
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            onClick={() => navigate(`/student/forum/thread/${thread.id}`)}
        >
            <div className="flex gap-4">
                {/* Vote Count (Left side) */}
                <div className="flex flex-col items-center gap-1 min-w-[3rem]">
                    <button
                        onClick={handleVote}
                        className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-[#8b5cf6]/10 hover:text-[#8b5cf6] transition-colors"
                    >
                        <ArrowUp size={20} />
                    </button>
                    <span className="font-bold text-gray-700 text-sm">{thread.upvotes}</span>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-1 rounded-lg bg-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                {thread.courseName}
                            </span>
                            {thread.status === 'Solved' && (
                                <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-bold">
                                    <CheckCircle size={12} /> Solved
                                </span>
                            )}
                        </div>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={12} /> {thread.createdAt}
                        </span>
                    </div>

                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#8b5cf6] transition-colors leading-tight">
                        {thread.title}
                    </h3>

                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                        {thread.description}
                    </p>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 mb-4">
                            {thread.tags && thread.tags.map(tag => (
                                <span key={tag} className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                            <div className="flex items-center gap-1.5 flex-row-reverse">
                                <span className="text-gray-600">{thread.authorName}</span>
                                <img src={thread.authorAvatar} alt={thread.authorName} className="w-5 h-5 rounded-full" />
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Eye size={14} /> {thread.views}
                            </div>
                            <div className="flex items-center gap-1.5 text-[#8b5cf6] bg-[#8b5cf6]/5 px-2 py-1 rounded-lg">
                                <MessageSquare size={14} /> {thread.repliesCount || 0} replies
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThreadCard;
