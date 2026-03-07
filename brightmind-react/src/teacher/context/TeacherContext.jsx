import React, { createContext, useContext, useState } from 'react';
import { initialAnnouncements, teacherProfile as mockProfile } from '../data/teacherMock';

// =========================================================
// TeacherContext — Global state for the Teacher Panel
// Replace state setters with API calls when backend is ready
// =========================================================

const TeacherContext = createContext(null);

export const TeacherProvider = ({ children }) => {
    const [profile, setProfile] = useState(mockProfile);
    const [announcements, setAnnouncements] = useState(initialAnnouncements);

    // --- API-ready functions (swap body with fetch/axios later) ---

    const updateProfile = (updatedData) => {
        // TODO: PUT /api/teacher/profile
        setProfile((prev) => ({ ...prev, ...updatedData }));
    };

    const addAnnouncement = (announcement) => {
        // TODO: POST /api/teacher/announcements
        const newItem = {
            ...announcement,
            id: `AN${Date.now()}`,
            postedAt: new Date().toISOString(),
        };
        setAnnouncements((prev) => [newItem, ...prev]);
    };

    const deleteAnnouncement = (id) => {
        // TODO: DELETE /api/teacher/announcements/:id
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    };

    return (
        <TeacherContext.Provider
            value={{
                profile,
                updateProfile,
                announcements,
                addAnnouncement,
                deleteAnnouncement,
            }}
        >
            {children}
        </TeacherContext.Provider>
    );
};

export const useTeacher = () => {
    const ctx = useContext(TeacherContext);
    if (!ctx) throw new Error('useTeacher must be used inside TeacherProvider');
    return ctx;
};

export default TeacherContext;
