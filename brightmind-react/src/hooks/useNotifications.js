import { useState, useEffect, useCallback } from 'react';
import api from '../utils/axiosConfig';

/**
 * Shared notification hook for all panels (Student, Teacher, Admin).
 * Uses the authenticated api instance (token included automatically).
 */
export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetch = useCallback(async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data || []);
        } catch (err) {
            // Silently fail — user may not be logged in yet
        }
    }, []);

    useEffect(() => {
        fetch();
        const interval = setInterval(fetch, 15000); // poll every 15s for near real-time
        return () => clearInterval(interval);
    }, [fetch]);

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const markAsReadByReference = async (referenceId) => {
        try {
            await api.patch(`/notifications/by-reference/${referenceId}/read`);
            setNotifications(prev => prev.map(n => n.referenceId === referenceId ? { ...n, read: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error(err);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;
    const unread = notifications.filter(n => !n.read);

    return { notifications, unread, unreadCount, markAsRead, markAsReadByReference, markAllAsRead, refetch: fetch };
};
