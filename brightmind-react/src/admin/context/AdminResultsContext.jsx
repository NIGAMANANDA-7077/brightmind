import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import api from '../../utils/axiosConfig';
import { mockAdminResults } from '../data/adminResultsMock';
import { mockAdminSubmissions } from '../data/adminSubmissionsMock';

const AdminResultsContext = createContext();

export const useAdminResults = () => useContext(AdminResultsContext);

export const AdminResultsProvider = ({ children }) => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [groupByBatch, setGroupByBatch] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        course: 'All',
        exam: 'All',
        batch: 'All'
    });

    // Helper: Recalculate Ranks
    const recalculateRanks = (currentResults) => {
        const groups = {};
        currentResults.forEach(r => {
            const key = `${r.examName}-${r.batch}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(r);
        });

        let updatedResults = [];
        Object.keys(groups).forEach(key => {
            const group = groups[key];
            group.sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
            group.forEach((item, index) => {
                item.rank = index + 1;
            });
            updatedResults = [...updatedResults, ...group];
        });
        return updatedResults;
    };

    // Initial Fetch of Exam Results & Users
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [resultsRes, usersRes, examsRes] = await Promise.all([
                    api.get('/exams/results/all'),
                    api.get('/users'),
                    api.get('/exams')
                ]);

                const users = usersRes.data;
                const exams = examsRes.data;

                const mappedResults = resultsRes.data.results.map(res => {
                    const studentInfo = users.find(u => u.id === res.studentId) || {};
                    const examInfo = exams.find(e => e.id === res.examId) || {};

                    return {
                        id: res.id,
                        studentId: res.studentId,
                        studentName: studentInfo.name || 'Unknown Student',
                        batch: studentInfo.batch || 'General',
                        course: examInfo.courseName || 'General Course',
                        examId: res.examId,
                        examName: examInfo.title || 'Unknown Exam',
                        omrScore: 0,
                        assignmentScore: 0,
                        quizScore: res.score,
                        totalScore: res.score,
                        totalMarks: res.totalMarks,
                        rank: 0,
                        status: (res.score / res.totalMarks) >= 0.4 ? 'Pass' : 'Fail',
                        submittedAt: res.submittedAt,
                        history: []
                    };
                });

                setResults(recalculateRanks(mappedResults));
            } catch (err) {
                console.error("Failed to fetch results", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Actions
    const updateFilters = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const toggleGroupByBatch = () => {
        setGroupByBatch(prev => !prev);
    };

    const updateStudentMarks = (id, newScores) => {
        setResults(prevResults => {
            const updated = prevResults.map(r => {
                if (r.id === id) {
                    const omr = parseInt(newScores.omrScore) || 0;
                    const assignment = parseInt(newScores.assignmentScore) || 0;
                    const quiz = parseInt(newScores.quizScore) || 0;
                    const total = omr + assignment + quiz;
                    const status = total >= 60 ? 'Pass' : 'Fail'; // Simple Mock Logic

                    return {
                        ...r,
                        omrScore: omr,
                        assignmentScore: assignment,
                        quizScore: quiz,
                        totalScore: total,
                        status: status
                    };
                }
                return r;
            });
            return recalculateRanks(updated);
        });
    };

    // --- Submission Management ---
    const [submissions, setSubmissions] = useState(mockAdminSubmissions);

    const getSubmissionsByExam = (examId) => {
        return submissions.filter(s => s.examId === examId);
    };

    const updateSubmissionGrade = (id, updatedData) => {
        setSubmissions(prev => prev.map(s =>
            s.id === id ? { ...s, ...updatedData, status: 'Draft' } : s
        ));
    };

    const publishSubmission = (id, finalData) => {
        setSubmissions(prev => prev.map(s =>
            s.id === id ? { ...s, ...finalData, status: 'Published' } : s
        ));

        // Integration: Update the main Results list
        const submission = submissions.find(s => s.id === id);
        if (submission) {
            // Find if result already exists for this student/exam
            // For mock, we'll just try to match studentId and examId or add new
            // This is a simplified integration.
            alert(`Result Published for ${submission.studentName}! (Mock Integration)`);
        }
    };

    const exportResults = () => {
        alert("Downloading Results CSV... (Mock)");
    };

    // Computed
    const resultStats = useMemo(() => {
        const totalAttempts = results.length;
        if (totalAttempts === 0) return { avgScore: 0, passPercentage: 0, highestScore: 0, totalAttempts: 0 };

        const totalScoreSum = results.reduce((sum, r) => sum + r.totalScore, 0);
        const passedCount = results.filter(r => r.status === 'Pass').length;
        const highest = Math.max(...results.map(r => r.totalScore));

        return {
            avgScore: Math.round(totalScoreSum / totalAttempts),
            passPercentage: Math.round((passedCount / totalAttempts) * 100),
            highestScore: highest,
            totalAttempts
        };
    }, [results]);

    const filteredResults = useMemo(() => {
        return results.filter(r => {
            const matchSearch = r.studentName.toLowerCase().includes(filters.search.toLowerCase()) ||
                r.studentId.toLowerCase().includes(filters.search.toLowerCase());
            const matchCourse = filters.course === 'All' || r.course === filters.course;
            const matchExam = filters.exam === 'All' || r.examName === filters.exam; // Using Name for Mock simplicity
            const matchBatch = filters.batch === 'All' || r.batch === filters.batch;

            return matchSearch && matchCourse && matchExam && matchBatch;
        });
    }, [results, filters]);

    // Derived Lists for Dropdowns
    const uniqueCourses = useMemo(() => ['All', ...new Set(results.map(r => r.course))], [results]);
    const uniqueExams = useMemo(() => ['All', ...new Set(results.map(r => r.examName))], [results]);
    const uniqueBatches = useMemo(() => ['All', ...new Set(results.map(r => r.batch))], [results]);

    const groupedResults = useMemo(() => {
        if (!groupByBatch) return null;

        const groups = {};
        filteredResults.forEach(r => {
            if (!groups[r.batch]) {
                groups[r.batch] = {
                    batchName: r.batch,
                    items: [],
                    stats: { avg: 0, pass: 0, high: 0 }
                };
            }
            groups[r.batch].items.push(r);
        });

        // Calculate Group Stats
        Object.values(groups).forEach(g => {
            const total = g.items.reduce((sum, i) => sum + i.totalScore, 0);
            const passed = g.items.filter(i => i.status === 'Pass').length;
            g.stats.avg = Math.round(total / g.items.length);
            g.stats.pass = Math.round((passed / g.items.length) * 100);
            g.stats.high = Math.max(...g.items.map(i => i.totalScore));
        });

        return groups;
    }, [filteredResults, groupByBatch]);

    return (
        <AdminResultsContext.Provider value={{
            results: filteredResults, // Exposed list
            resultStats,
            filters,
            groupByBatch,
            uniqueCourses,
            uniqueExams,
            uniqueBatches,
            groupedResults,
            updateFilters,
            toggleGroupByBatch,
            updateStudentMarks,
            exportResults,
            // Submissions
            getSubmissionsByExam,
            updateSubmissionGrade,
            publishSubmission
        }}>
            {children}
        </AdminResultsContext.Provider>
    );
};
