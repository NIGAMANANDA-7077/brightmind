import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUp, MessageSquare, CheckCircle, Send, Eye, Trash2, Lock } from 'lucide-react';
import { useForum } from '../../context/ForumContext';
import { useUser } from '../../context/UserContext';
import ReplyCard from '../../components/student/forum/ReplyCard';
import api from '../../utils/axiosConfig';

const ThreadDetail = () => {
    const { threadId } = useParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const { getThread, addReply, upvoteThread, acceptAnswer, deleteComment, deleteThread } = useForum();
    const [thread, setThread] = useState(null);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const isTeacher = user?.role === 'Teacher' || user?.role === 'Admin';
    const isAuthor = thread?.authorId === user?.id;
    const basePath = user?.role === 'Teacher' ? '/teacher' : '/student';

    const fetchThreadDetail = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        const data = await getThread(threadId);
        setThread(data);
        if (showLoading) setLoading(false);
    };

    React.useEffect(() => {
        fetchThreadDetail(true);
        const interval = setInterval(() => fetchThreadDetail(false), 15000);
        return () => clearInterval(interval);
    }, [threadId]);

    if (loading) return (
        <div className="p-8 flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
        </div>
    );
    if (!thread) return <div className="p-8 text-center text-gray-500">Thread not found</div>;

    const handleVote = async () => {
        const result = await upvoteThread(threadId);
        if (result.success) {
            setThread(prev => ({ ...prev, upvotes: result.upvotes }));
        } else if (result.message?.includes('already upvoted')) {
            alert("You have already upvoted this discussion!");
        }
    };

    const handleSubmitReply = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;
        setSubmitting(true);
        await addReply(threadId, replyContent);
        setReplyContent('');
        await fetchThreadDetail(false);
        setSubmitting(false);
    };

    const handleAcceptAnswer = async (commentId) => {
        const ok = window.confirm('Mark this as the Best Answer? This will mark the thread as Resolved.');
        if (!ok) return;
        const result = await acceptAnswer(threadId, commentId);
        if (result.success) await fetchThreadDetail(false);
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Delete this reply?')) return;
        const result = await deleteComment(threadId, commentId);
        if (result.success) {
            setThread(prev => ({ ...prev, comments: prev.comments.filter(c => c.id !== commentId) }));
        }
    };

    const handleDeleteThread = async () => {
        if (!window.confirm('Delete this entire discussion? This cannot be undone.')) return;
        const result = await deleteThread(threadId);
        if (result.success) navigate(`${basePath}/forum`);
    };

    const handleCloseThread = async () => {
        if (!window.confirm('Close this discussion? Students won\'t be able to reply.')) return;
        // Use direct API call since context doesn't expose updateThreadStatus
        try {
            await api.patch(`/forum/${threadId}/status`, { status: 'Closed' });
            setThread(prev => ({ ...prev, status: 'Closed' }));
        } catch (_) {}
    };

    const sortedComments = [...(thread.comments || [])].sort((a, b) => {
        if (a.isAccepted && !b.isAccepted) return -1;
        if (!a.isAccepted && b.isAccepted) return 1;
        return (b.upvotes || 0) - (a.upvotes || 0);
    });

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
        <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
            {/* Back */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(`${basePath}/forum`)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
                >
                    <ArrowLeft size={20} /> Back to Discussions
                </button>

                {/* Teacher moderation actions */}
                {isTeacher && (
                    <div className="flex items-center gap-2">
                        {thread.status === 'Open' && (
                            <button
                                onClick={handleCloseThread}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                            >
                                <Lock size={14} /> Close Thread
                            </button>
                        )}
                        <button
                            onClick={handleDeleteThread}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                        >
                            <Trash2 size={14} /> Delete Thread
                        </button>
                    </div>
                )}
                {!isTeacher && isAuthor && (
                    <button
                        onClick={handleDeleteThread}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                    >
                        <Trash2 size={14} /> Delete
                    </button>
                )}
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8">
                    {/* Status badges */}
                    <div className="flex items-center gap-2 mb-5 flex-wrap">
                        {thread.courseName && (
                            <span className="px-3 py-1 rounded-lg bg-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                {thread.courseName}
                            </span>
                        )}
                        {thread.batchName && (
                            <span className="px-3 py-1 rounded-lg bg-blue-50 text-xs font-bold text-blue-500 border border-blue-100">
                                {thread.batchName}
                            </span>
                        )}
                        {thread.status === 'Resolved' && (
                            <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-bold">
                                <CheckCircle size={12} /> Solved
                            </span>
                        )}
                        {thread.status === 'Closed' && (
                            <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-200 text-gray-600 text-xs font-bold">
                                <Lock size={12} /> Closed
                            </span>
                        )}
                        <span className="text-gray-400 text-xs flex items-center gap-1 ml-auto">
                            <Eye size={14} /> {thread.views || 0} views • {getTimeAgo(thread.createdAt)}
                        </span>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-4">{thread.title}</h1>

                    {/* Author */}
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                        <img
                            src={thread.author?.avatar || thread.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(thread.authorName || 'U')}&background=8b5cf6&color=fff`}
                            alt={thread.authorName}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <div className="font-bold text-gray-900">{thread.author?.name || thread.authorName}</div>
                            <div className="text-xs text-gray-500">{thread.author?.role || thread.authorRole}</div>
                        </div>
                    </div>

                    <div className="text-gray-700 mb-6 leading-relaxed whitespace-pre-wrap text-sm">{thread.description}</div>

                    {/* Tags */}
                    {thread.tags && thread.tags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap mb-6">
                            {thread.tags.map(tag => (
                                <span key={tag} className="text-sm font-medium text-[#8b5cf6] bg-[#8b5cf6]/5 px-3 py-1.5 rounded-lg border border-[#8b5cf6]/10">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                        <button
                            onClick={handleVote}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 text-gray-600 font-bold hover:bg-[#8b5cf6] hover:text-white transition-all ring-1 ring-gray-200 hover:ring-[#8b5cf6] text-sm"
                        >
                            <ArrowUp size={16} /> {thread.upvotes || 0} Upvotes
                        </button>
                        <span className="flex items-center gap-2 text-gray-500 font-bold text-sm">
                            <MessageSquare size={16} /> {(thread.comments || []).length} Replies
                        </span>
                    </div>
                </div>
            </div>

            {/* Answers Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-lg font-bold text-gray-900">
                        {(thread.comments || []).length} {(thread.comments || []).length === 1 ? 'Answer' : 'Answers'}
                    </h2>
                    {sortedComments.some(c => c.isAccepted) && (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                            <CheckCircle size={12} /> Best answer marked
                        </span>
                    )}
                </div>

                {sortedComments.length > 0 ? (
                    <div className="space-y-4">
                        {sortedComments.map(reply => (
                            <ReplyCard
                                key={reply.id}
                                reply={reply}
                                threadId={threadId}
                                onAccept={isTeacher && thread.status !== 'Resolved' ? handleAcceptAnswer : null}
                                onDelete={handleDeleteComment}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-12 text-center">
                        <MessageSquare size={32} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-500 font-medium">No answers yet.</p>
                        <p className="text-gray-400 text-sm mt-1">Be the first to answer!</p>
                    </div>
                )}
            </div>

            {/* Reply Editor */}
            {thread.status !== 'Closed' ? (
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                        {isTeacher ? '✏️ Post an Answer' : '💬 Post a Reply'}
                    </h3>
                    <form onSubmit={handleSubmitReply}>
                        <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder={isTeacher ? "Type your answer here. You can mark your answer as Best Answer too." : "Type your answer here..."}
                            rows={5}
                            className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] resize-none mb-4 text-sm"
                        />
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={!replyContent.trim() || submitting}
                                className="flex items-center gap-2 px-6 py-3 bg-[#8b5cf6] text-white rounded-xl font-bold hover:bg-[#7c3aed] transition-all shadow-lg shadow-purple-500/20 active:scale-95 disabled:opacity-50 text-sm"
                            >
                                <Send size={16} />
                                {submitting ? 'Posting...' : 'Post Reply'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 text-center text-gray-500">
                    <Lock size={20} className="mx-auto mb-2 text-gray-400" />
                    <p className="font-medium">This thread is closed. No new replies allowed.</p>
                </div>
            )}
        </div>
    );
};

export default ThreadDetail;
