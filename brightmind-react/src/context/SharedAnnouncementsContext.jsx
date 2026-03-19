import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// =========================================================
// SharedAnnouncementsContext (Connected to Backend)
// Shared between Admin and Teacher panels.
// =========================================================

import api from '../utils/axiosConfig';
import { useUser } from './UserContext';

const SharedAnnouncementsContext = createContext(null);

export const useSharedAnnouncements = () => {
    const ctx = useContext(SharedAnnouncementsContext);
    if (!ctx) throw new Error('useSharedAnnouncements must be inside SharedAnnouncementsProvider');
    return ctx;
};

export const SharedAnnouncementsProvider = ({ children }) => {
    const { user, loading: userLoading } = useUser();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAnnouncements = async () => {
        try {
            const res = await api.get('/announcements');
            setAnnouncements(res.data);
        } catch (err) {
            console.error("Failed to fetch announcements:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!userLoading) {
            if (user) {
                fetchAnnouncements();
            } else {
                setLoading(false);
            }
        }
    }, [user, userLoading]);

    const addAnnouncement = async (data) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const scheduleDate = data.date || today;
            const status = scheduleDate > today ? 'Scheduled' : 'Published';

            const payload = { ...data, date: scheduleDate, status, postedBy: data.postedBy || 'Admin' };
            const res = await api.post('/announcements', payload);
            setAnnouncements(prev => [res.data, ...prev]);
        } catch (err) {
            console.error("Add announcement err:", err);
        }
    };

    const updateAnnouncement = async (id, updatedData) => {
        try {
            const res = await api.put(`/announcements/${id}`, updatedData);
            setAnnouncements(prev => prev.map(a => a.id === id ? res.data : a));
        } catch (err) {
            console.error("Update err:", err);
        }
    };

    const deleteAnnouncement = async (id) => {
        try {
            await api.delete(`/announcements/${id}`);
            setAnnouncements(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            console.error("Delete err:", err);
        }
    };

    return (
        <SharedAnnouncementsContext.Provider value={{
            announcements,
            loading,
            addAnnouncement,
            updateAnnouncement,
            deleteAnnouncement,
        }}>
            {children}
        </SharedAnnouncementsContext.Provider>
    );
};
