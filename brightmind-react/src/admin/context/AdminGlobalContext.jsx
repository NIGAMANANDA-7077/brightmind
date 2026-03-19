import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';
import { useSharedAnnouncements } from '../../context/SharedAnnouncementsContext';

const AdminGlobalContext = createContext();

export const useAdminGlobal = () => useContext(AdminGlobalContext);

export const AdminGlobalProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const { announcements, addAnnouncement: _addAnnouncement, updateAnnouncement: _updateAnnouncement, deleteAnnouncement: _deleteAnnouncement } = useSharedAnnouncements();
    const [settings, setSettings] = useState({
        lmsName: 'BrightMIND Academy',
        timezone: 'IST',
        passwordPolicy: 'Strong',
        notifications: { email: true, sms: false },
        themeColor: '#8b5cf6'
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/users');
            setUsers(res.data.map(u => ({
                ...u,
                joinedDate: new Date(u.createdAt).toISOString().split('T')[0],
                // courses is now supplied by the backend (teacher course titles / student is empty)
                courses: u.courses || []
            })));
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBatches = async () => {
        try {
            const res = await api.get('/batches');
            setBatches(res.data.data || res.data);
        } catch (err) {
            console.error("Failed to fetch batches:", err);
        }
    };


    const addUser = async (userData) => {
        try {
            const res = await api.post('/users', userData);
            setUsers(prev => [res.data, ...prev]);
        } catch (err) {
            console.error("Failed to add user:", err);
        }
    };

    const updateUserStatus = async (id, status) => {
        try {
            await api.patch(`/users/${id}/status`, { status });
            setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    const deleteUser = async (id) => {
        try {
            await api.delete(`/users/${id}`);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (err) {
            console.error("Failed to delete user:", err);
        }
    };

    const updateUser = async (updatedUser) => {
        try {
            const res = await api.put(`/users/${updatedUser.id}`, updatedUser);
            setUsers(prev => prev.map(u => u.id === updatedUser.id ? res.data : u));
            await fetchUsers(); // Refresh to ensure all fields are synced
        } catch (err) {
            console.error("Failed to update user:", err);
        }
    };

    // Batch Actions (Local for now)
    const createBatch = (name) => {
        const newBatch = {
            id: Date.now(),
            name,
            createdAt: new Date().toISOString().split('T')[0]
        };
        setBatches([...batches, newBatch]);
        return newBatch;
    };

    const assignBatchToUser = async (userId, batchId, batchName) => {
        try {
            await api.post(`/batches/${batchId}/students`, { studentIds: [userId] });
            setUsers(users.map(u => u.id === userId ? { ...u, enrolledBatches: [{ id: batchId, batchName }] } : u));
        } catch (err) {
            console.error("Failed to assign batch", err);
        }
    };

    const assignBatchToUsers = async (userIds, batchId, batchName) => {
        try {
            await api.post(`/batches/${batchId}/students`, { studentIds: userIds });
            setUsers(users.map(u => userIds.includes(u.id) ? { ...u, enrolledBatches: [{ id: batchId, batchName }] } : u));
        } catch (err) {
            console.error("Failed to assign batch", err);
        }
    };

    // Announcement Actions — delegated to SharedAnnouncementsContext
    const addAnnouncement = _addAnnouncement;
    const updateAnnouncement = _updateAnnouncement;
    const deleteAnnouncement = _deleteAnnouncement;

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            if (res.data && Object.keys(res.data).length > 0) {
                // If backend has 'global' key, use it
                if (res.data.global) {
                    setSettings(res.data.global);
                }
            }
        } catch (err) {
            console.error("Failed to fetch settings:", err);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchBatches();
        fetchSettings();
    }, []);

    // Settings Actions
    const updateSettings = async (newSettings) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        try {
            await api.post('/settings', { key: 'global', value: updated });
        } catch (err) {
            console.error("Failed to persist settings:", err);
        }
    };

    return (
        <AdminGlobalContext.Provider value={{
            users,
            loading,
            userActions: { addUser, updateUserStatus, deleteUser, updateUser, assignBatchToUser, assignBatchToUsers, refreshUsers: fetchUsers },
            batches,
            batchActions: { createBatch },
            announcements,
            announcementActions: { addAnnouncement, updateAnnouncement, deleteAnnouncement },
            settings,
            updateSettings
        }}>
            {children}
        </AdminGlobalContext.Provider>
    );
};
