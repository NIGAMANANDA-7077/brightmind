import React, { createContext, useState, useContext, useEffect } from 'react';
import { forumThreads as initialThreads } from '../data/forumMock';

const ForumContext = createContext();

export const useForum = () => useContext(ForumContext);

export const ForumProvider = ({ children }) => {
    const [threads, setThreads] = useState(() => {
        const saved = localStorage.getItem('forum_threads');
        return saved ? JSON.parse(saved) : initialThreads;
    });

    useEffect(() => {
        localStorage.setItem('forum_threads', JSON.stringify(threads));
    }, [threads]);

    const addThread = (newThread) => {
        const thread = {
            ...newThread,
            id: Date.now().toString(),
            replies: [],
            upvotes: 0,
            views: 0,
            createdAt: 'Just now',
            status: 'Open',
            author: {
                name: "Current User", // Mock user
                role: "Student",
                avatar: "https://i.pravatar.cc/150?img=1"
            }
        };
        setThreads([thread, ...threads]);
    };

    const addReply = (threadId, content) => {
        setThreads(threads.map(thread => {
            if (thread.id === threadId) {
                return {
                    ...thread,
                    replies: [...thread.replies, {
                        id: Date.now().toString(),
                        content,
                        author: {
                            name: "Current User",
                            role: "Student",
                            avatar: "https://i.pravatar.cc/150?img=1"
                        },
                        createdAt: 'Just now',
                        upvotes: 0,
                        isAccepted: false
                    }]
                };
            }
            return thread;
        }));
    };

    const upvoteThread = (threadId) => {
        setThreads(threads.map(t =>
            t.id === threadId ? { ...t, upvotes: t.upvotes + 1 } : t
        ));
    };

    const getThread = (threadId) => {
        return threads.find(t => t.id === threadId);
    };

    const getThreadsByCourse = (courseId) => {
        return threads.filter(t => t.courseId === courseId);
    };

    return (
        <ForumContext.Provider value={{
            threads,
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
