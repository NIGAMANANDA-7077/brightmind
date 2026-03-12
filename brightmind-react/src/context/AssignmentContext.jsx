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

    const submitAssignment = async (assignmentId, submissionData) => {
        try {
            const res = await api.post(`/assignments/${assignmentId}/submit`, {
                assignmentId,
                ...submissionData
            });

            // Update local state
            setAssignments(prev => prev.map(a =>
                a.id === assignmentId ? {
                    ...a,
                    status: res.data.status,
                    submissionDate: res.data.submittedAt,
                    studentSubmission: res.data
                } : a
            ));

            return res.data;
        } catch (err) {
            console.error("Failed to submit assignment:", err);
            throw err;
        }
    };

    const submitFileAssignment = (id, fileName) => {
        return submitAssignment(id, { fileName });
    };

    const submitWrittenAssignment = (id, content) => {
        return submitAssignment(id, { content });
    };

    const submitOMR = (id, answers, score) => {
        return submitAssignment(id, { answers, grade: score, status: 'Graded' });
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
