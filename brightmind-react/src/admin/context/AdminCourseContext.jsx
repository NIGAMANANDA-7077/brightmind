import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';

const AdminCourseContext = createContext();

export const useAdminCourses = () => useContext(AdminCourseContext);

export const AdminCourseProvider = ({ children }) => {
    const [courses, setCourses] = useState([]);
    const [mediaAssets, setMediaAssets] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const res = await api.get('/courses');
            setCourses(res.data);
        } catch (err) {
            console.error("Failed to fetch Admin courses:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    // Course Actions
    const addCourse = async (course) => {
        try {
            const res = await api.post('/courses', { ...course, status: 'Draft' });
            setCourses([res.data, ...courses]);
            return res.data;
        } catch (err) {
            console.error("Add Course Error", err);
        }
    };

    const updateCourse = async (id, updatedData) => {
        try {
            const res = await api.put(`/courses/${id}`, updatedData);
            setCourses(prev => prev.map(course => (course.id === id ? res.data : course)));
        } catch (err) {
            console.error("Update Course Error", err);
        }
    };

    const deleteCourse = async (id) => {
        try {
            await api.delete(`/courses/${id}`);
            setCourses(prev => prev.filter(course => course.id !== id));
        } catch (err) {
            console.error("Delete Course Error", err);
        }
    };

    const togglePublishStatus = async (id) => {
        const course = courses.find(c => c.id === id);
        if (!course) return;

        const isPublished = course.status === 'Published' || course.status === 'Active';
        const newStatus = isPublished ? 'Draft' : 'Active';
        try {
            const res = await api.put(`/courses/${id}`, { status: newStatus });
            setCourses(prev => prev.map(c => c.id === id ? { ...c, ...res.data, status: newStatus } : c));
        } catch (err) {
            console.error("Toggle publish status err", err);
        }
    };

    // Media Actions
    const addMedia = async (files) => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        try {
            const res = await api.post('/upload/multiple', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data.success) {
                const newAssets = res.data.files.map((backendFile, index) => ({
                    id: Date.now() + index,
                    name: backendFile.fileName,
                    type: backendFile.mimetype.split('/')[0] === 'image' ? 'image' :
                        backendFile.mimetype.split('/')[0] === 'video' ? 'video' : 'document',
                    size: (backendFile.size / (1024 * 1024)).toFixed(2) + ' MB',
                    date: 'Just now',
                    url: backendFile.url
                }));
                setMediaAssets(prev => [...newAssets, ...prev]);
            }
        } catch (err) {
            console.error("Failed to upload media:", err);
        }
    };

    const addYoutubeLink = (url, name) => {
        const newAsset = {
            id: Date.now(),
            name: name || 'YouTube Video',
            type: 'video',
            size: 'External',
            date: 'Just now',
            url: url,
            isYoutube: true
        };
        setMediaAssets(prev => [newAsset, ...prev]);
    };

    const deleteMedia = (id) => {
        setMediaAssets(prev => prev.filter(asset => asset.id !== id));
    };

    const assignMedia = (assetId, assignment) => {
        setMediaAssets(prev => prev.map(asset =>
            asset.id === assetId ? { ...asset, ...assignment } : asset
        ));
    };

    const updateMedia = (id, updatedData) => {
        setMediaAssets(prev => prev.map(asset =>
            asset.id === id ? { ...asset, ...updatedData } : asset
        ));
    };

    return (
        <AdminCourseContext.Provider value={{
            courses,
            loading,
            mediaAssets,
            addCourse,
            updateCourse,
            deleteCourse,
            getCourse: (id) => courses.find(c => c.id.toString() === id.toString()),
            togglePublishStatus,
            addMedia,
            addYoutubeLink,
            deleteMedia,
            updateMedia,
            assignMedia
        }}>
            {children}
        </AdminCourseContext.Provider>
    );
};
