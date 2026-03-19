import React from 'react';
import { MessageSquare, ArrowUp, Eye, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForum } from '../../../context/ForumContext';
import { useUser } from '../../../context/UserContext';

const ThreadCard = ({ thread }) => {
    const navigate = useNavigate();
    const { user } = useUser();
    const { upvoteThread } = useForum();

    const basePath = user?.role === 'Teacher' ? '/teacher' : user?.role === 'Admin' ? '/admin' : '/student';

    const handleVote = async (e) => {
        e.stopPropagation();
        const result = await upvoteThread(thread.id);
        if (!result.success && result.message?.includes('already upvoted')) {
            alert("You have already upvoted this discussion!");
        }
    };

    const getTimeAgo = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / 60000);
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            onClick={() => navigate(`${basePath}/forum/thread/${thread.id}`)}
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
                    <span className="font-bold text-gray-700 text-sm">{thread.upvotes || 0}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            {thread.courseName && (
                                <span className="px-2 py-1 rounded-lg bg-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                    {thread.courseName}
                                </span>
                            )}
                            {thread.batchName && (
                                <span className="px-2 py-1 rounded-lg bg-blue-50 text-xs font-bold text-blue-500 border border-blue-100">
                                    {thread.batchName}
                                </span>
                            )}
                            {thread.status === 'Resolved' && (
                                <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-bold">
                                    <CheckCircle size={12} /> Solved
                                </span>
                            )}
                            {thread.status === 'Closed' && (
                                <span className="px-2 py-1 rounded-lg bg-gray-200 text-gray-600 text-xs font-bold">Closed</span>
                            )}
                        </div>
                        <span className="text-xs text-gray-400 flex items-center gap-1 whitespace-nowrap flex-shrink-0">
                            <Clock size={12} /> {getTimeAgo(thread.createdAt)}
                        </span>
                    </div>

                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#8b5cf6] transition-colors leading-tight line-clamp-2">
                        {thread.title}
                    </h3>

                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                        {thread.description}
                    </p>

                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            {thread.tags && thread.tags.slice(0, 4).map(tag => (
                                <span key={tag} className="text-xs font-medium text-[#8b5cf6] bg-[#8b5cf6]/5 px-2 py-1 rounded-lg border border-[#8b5cf6]/10">
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                            <div className="flex items-center gap-1.5">
                                <img
                                    src={thread.author?.avatar || thread.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(thread.authorName || 'U')}&background=8b5cf6&color=fff`}
                                    alt={thread.authorName}
                                    className="w-5 h-5 rounded-full object-cover"
                                />
                                <span className="text-gray-600">{thread.author?.name || thread.authorName}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Eye size={14} /> {thread.views || 0}
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
