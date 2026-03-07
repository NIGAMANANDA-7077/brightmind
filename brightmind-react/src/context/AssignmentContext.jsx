import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/axiosConfig';

const AssignmentContext = createContext();

export const useAssignment = () => useContext(AssignmentContext);

export const AssignmentProvider = ({ children }) => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAssignments = async () => {
        try {
            const res = await api.get('/assignments');
            setAssignments(res.data);
        } catch (err) {
            console.error("Failed to fetch assignments:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, []);

    const getAssignment = (id) => {
        return assignments.find(a => a.id === id);
    };

    const _updateBackend = async (id, payload) => {
        try {
            // we will use PUT /api/assignments/:id when implemented, 
            // for now, we will assume a generic endpoint handles it
            await api.put(`/assignments/${id}`, payload);
        } catch (err) {
            console.error("Failed to update assignment status in backend", err);
        }
    };

    const submitFileAssignment = (id, fileName) => {
        const updated = {
            status: 'Submitted',
            submittedDate: new Date().toLocaleDateString(),
            submission: { file: fileName }
        };
        setAssignments(assignments.map(a => a.id === id ? { ...a, ...updated } : a));
        _updateBackend(id, updated);
    };

    const submitWrittenAssignment = (id, content) => {
        const updated = {
            status: 'Submitted',
            submittedDate: new Date().toLocaleDateString(),
            submission: { content }
        };
        setAssignments(assignments.map(a => a.id === id ? { ...a, ...updated } : a));
        _updateBackend(id, updated);
    };

    const submitOMR = (id, answers, score) => {
        const updated = {
            status: 'Graded',
            submittedDate: new Date().toLocaleDateString(),
            submission: { answers, score }
        };
        setAssignments(assignments.map(a => a.id === id ? { ...a, ...updated } : a));
        _updateBackend(id, updated);
    };

    return (
        <AssignmentContext.Provider value={{
            assignments,
            loading,
            getAssignment,
            submitFileAssignment,
            submitWrittenAssignment,
            submitOMR
        }}>
            {children}
        </AssignmentContext.Provider>
    );
};
