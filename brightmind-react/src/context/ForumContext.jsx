import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/axiosConfig';
import { forumThreads as initialThreads } from '../data/forumMock';
import { useUser } from './UserContext';

const ForumContext = createContext();

export const useForum = () => useContext(ForumContext);

export const ForumProvider = ({ children }) => {
    const { user, loading: userLoading } = useUser();
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchThreads = async (courseId) => {
        setLoading(true);
        try {
            const url = courseId ? `/forum?courseId=${courseId}` : '/forum';
            const res = await api.get(url);
            setThreads(res.data);
        } catch (err) {
            console.error("Failed to fetch threads:", err);
        } finally {
            setLoading(false);
        }
    };

    const addThread = async (newThreadData) => {
        try {
            const res = await api.post('/forum', newThreadData);
            // Re-fetch threads so the list has full joined data (author, batch, courseName, etc.)
            await fetchThreads();
            return res.data;
        } catch (err) {
            console.error("Failed to add thread:", err);
            throw err;
        }
    };

    const addReply = async (threadId, content) => {
        try {
            const res = await api.post(`/forum/${threadId}/comments`, { content });
            // Refresh thread data if needed or update local state
            setThreads(threads.map(t => {
                if (t.id === threadId) {
                    return {
                        ...t,
                        repliesCount: (t.repliesCount || 0) + 1
                    };
                }
                return t;
            }));
            return res.data;
        } catch (err) {
            console.error("Failed to add reply:", err);
            throw err;
        }
    };

    const upvoteThread = async (threadId) => {
        try {
            const res = await api.post(`/forum/${threadId}/upvote`);
            const updatedThread = res.data;
            setThreads(threads.map(t =>
                t.id === threadId ? { ...t, upvotes: updatedThread.upvotes } : t
            ));
            return { success: true, upvotes: updatedThread.upvotes };
        } catch (err) {
            console.error("Failed to upvote thread:", err);
            return {
                success: false,
                message: err.response?.data?.message || "Failed to upvote"
            };
        }
    };

    const upvoteComment = async (threadId, commentId) => {
        try {
            const res = await api.post(`/forum/${threadId}/comments/${commentId}/upvote`);
            return { success: true, upvotes: res.data.upvotes };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Failed to upvote' };
        }
    };

    const acceptAnswer = async (threadId, commentId) => {
        try {
            await api.post(`/forum/${threadId}/comments/${commentId}/accept`);
            setThreads(threads.map(t => t.id === threadId ? { ...t, status: 'Resolved' } : t));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Failed' };
        }
    };

    const deleteComment = async (threadId, commentId) => {
        try {
            await api.delete(`/forum/${threadId}/comments/${commentId}`);
            setThreads(threads.map(t => t.id === threadId ? { ...t, repliesCount: Math.max(0, (t.repliesCount || 1) - 1) } : t));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Failed to delete' };
        }
    };

    const deleteThread = async (threadId) => {
        try {
            await api.delete(`/forum/${threadId}`);
            setThreads(prev => prev.filter(t => t.id !== threadId));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || 'Failed to delete' };
        }
    };

    const getThread = async (threadId) => {
        try {
            const res = await api.get(`/forum/${threadId}`);
            return res.data;
        } catch (err) {
            console.error("Failed to fetch thread detail:", err);
            return null;
        }
    };

    const getThreadsByCourse = (courseId) => {
        // Since we now fetch per course or filtered, 
        // this might just return from local state if already fetched
        return threads.filter(t => t.courseId === courseId);
    };

    useEffect(() => {
        if (userLoading) return;
        if (!user) {
            setLoading(false);
            return;
        }

        fetchThreads();

        // Real-time polling (every 10 seconds)
        const interval = setInterval(() => {
            fetchThreads();
        }, 10000);

        return () => clearInterval(interval);
    }, [user, userLoading]);

    return (
        <ForumContext.Provider value={{
            threads,
            loading,
            fetchThreads,
            addThread,
            addReply,
            upvoteThread,
            upvoteComment,
            acceptAnswer,
            deleteComment,
            deleteThread,
            getThread,
            getThreadsByCourse
        }}>
            {children}
        </ForumContext.Provider>
    );
};
