import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';

const AdminSchedulerContext = createContext();

export const useAdminScheduler = () => useContext(AdminSchedulerContext);

export const AdminSchedulerProvider = ({ children }) => {
    const [schedules, setSchedules] = useState([]);
    const [results, setResults] = useState([]);
    const [stats, setStats] = useState({
        totalExams: 0,
        completedExams: 0,
        averageScore: 0,
        passRate: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [examsRes, resultsRes] = await Promise.all([
                api.get('/exams'),
                api.get('/exams/results/all') // I'll need to create this admin route
            ]);

            // Filter exams that are scheduled
            const scheduledExams = examsRes.data
                .filter(e => e.scheduledAt)
                .map(e => ({
                    ...e,
                    start: new Date(e.scheduledAt),
                    end: new Date(e.expiresAt),
                    title: e.title,
                    type: 'Exam'
                }));

            setSchedules(scheduledExams);
            setResults(resultsRes.data.results || []);

            // Calculate stats
            const total = resultsRes.data.results?.length || 0;
            const avg = total > 0 ? (resultsRes.data.results.reduce((s, r) => s + r.score, 0) / total) : 0;

            setStats({
                totalExams: examsRes.data.length,
                completedExams: resultsRes.data.results?.length || 0,
                averageScore: Math.round(avg),
                passRate: 85 // Mock for now
            });
        } catch (err) {
            console.error("Failed to fetch scheduler data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const addSchedule = async (schedule) => {
        try {
            await api.post('/exams/schedule', schedule);
            await fetchData();
        } catch (err) {
            console.error("Failed to add schedule:", err);
        }
    };

    const updateSchedule = async (id, updatedData) => {
        try {
            await api.put(`/exams/${id}`, updatedData);
            await fetchData();
        } catch (err) {
            console.error("Failed to update schedule:", err);
        }
    };

    const deleteSchedule = async (id) => {
        try {
            await api.put(`/exams/${id}`, { scheduledAt: null, expiresAt: null, status: 'Approved' });
            await fetchData();
        } catch (err) {
            console.error("Failed to delete schedule:", err);
        }
    };

    return (
        <AdminSchedulerContext.Provider value={{
            schedules,
            results,
            stats,
            addSchedule,
            updateSchedule,
            deleteSchedule
        }}>
            {children}
        </AdminSchedulerContext.Provider>
    );
};
