import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUp, MessageSquare, CheckCircle, Share2, MoreVertical, Send, Eye } from 'lucide-react';
import { useForum } from '../../context/ForumContext';
import ReplyCard from '../../components/student/forum/ReplyCard';

const ThreadDetail = () => {
    const { threadId } = useParams();
    const navigate = useNavigate();
    const { getThread, addReply, upvoteThread } = useForum();
    const [replyContent, setReplyContent] = useState('');

    const thread = getThread(threadId);

    if (!thread) return <div className="p-8">Thread not found</div>;

    const handleVote = () => {
        upvoteThread(threadId);
    };

    const handleSubmitReply = (e) => {
        e.preventDefault();
        if (replyContent.trim()) {
            addReply(threadId, replyContent);
            setReplyContent('');
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
            >
                <ArrowLeft size={20} /> Back to Discussions
            </button>

            {/* Original Question Card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8">
                    {/* Header Info */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-lg bg-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                {thread.courseName}
                            </span>
                            {thread.status === 'Solved' && (
                                <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-bold">
                                    <CheckCircle size={12} /> Solved
                                </span>
                            )}
                        </div>
                        <div className="text-gray-400 text-sm flex items-center gap-4">
                            <span className="flex items-center gap-1"><Eye size={16} /> {thread.views} views</span>
                            <span>{thread.createdAt}</span>
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-4">{thread.title}</h1>

                    {/* Author */}
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                        <img src={thread.author.avatar} alt={thread.author.name} className="w-10 h-10 rounded-full" />
                        <div>
                            <div className="font-bold text-gray-900">{thread.author.name}</div>
                            <div className="text-xs text-gray-500">{thread.author.role}</div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="prose max-w-none text-gray-700 mb-8 leading-relaxed">
                        <p>{thread.description}</p>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-2 mb-8">
                        {thread.tags.map(tag => (
                            <span key={tag} className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                #{tag}
                            </span>
                        ))}
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleVote}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 text-gray-600 font-bold hover:bg-[#8b5cf6] hover:text-white transition-all ring-1 ring-gray-200 hover:ring-[#8b5cf6]"
                            >
                                <ArrowUp size={18} />
                                <span>{thread.upvotes} Upvotes</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-500 font-bold hover:bg-gray-50 transition-colors">
                                <MessageSquare size={18} />
                                <span>{thread.replies.length} Replies</span>
                            </button>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Replies Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                    <h2 className="text-lg font-bold text-gray-900">{thread.replies.length} Replies</h2>
                </div>

                <div className="space-y-4">
                    {thread.replies.map(reply => (
                        <ReplyCard key={reply.id} reply={reply} />
                    ))}
                </div>

                {/* Reply Editor */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mt-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Post a Reply</h3>
                    <form onSubmit={handleSubmitReply}>
                        <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Type your answer here..."
                            rows={6}
                            className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] resize-none mb-4"
                        />
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={!replyContent.trim()}
                                className="flex items-center gap-2 px-8 py-3 bg-[#8b5cf6] text-white rounded-xl font-bold hover:bg-[#7c3aed] transition-all shadow-lg shadow-purple-500/20 active:scale-95 disabled:opacity-50"
                            >
                                <Send size={18} />
                                Post Reply
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ThreadDetail;
