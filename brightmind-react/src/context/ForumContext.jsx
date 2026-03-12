import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/axiosConfig';
import { forumThreads as initialThreads } from '../data/forumMock';

const ForumContext = createContext();

export const useForum = () => useContext(ForumContext);

export const ForumProvider = ({ children }) => {
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
            setThreads([res.data, ...threads]);
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
        fetchThreads();

        // Real-time polling (every 10 seconds)
        const interval = setInterval(() => {
            fetchThreads();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    return (
        <ForumContext.Provider value={{
            threads,
            loading,
            fetchThreads,
            addThread,
            addReply,
            upvoteThread,
            getThread,
            getThreadsByCourse
        }}>
            {children}
        </ForumContext.Provider>
    );
};
