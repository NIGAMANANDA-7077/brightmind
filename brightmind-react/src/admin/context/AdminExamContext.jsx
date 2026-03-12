import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';
import { useUser } from '../../context/UserContext';

const AdminExamContext = createContext();

export const useAdminExams = () => useContext(AdminExamContext);

export const AdminExamProvider = ({ children }) => {
    const { user } = useUser();
    const [questions, setQuestions] = useState([]);
    const [exams, setExams] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const mapQuestionToBackend = (q) => ({
        courseId: q.courseId,
        questionText: q.text,
        questionType: q.type,
        topic: q.topic,
        difficulty: q.difficulty,
        marks: q.marks,
        explanation: q.explanation,
        options: q.options?.map(opt => ({
            optionText: opt,
            isCorrect: opt === q.correctAnswer
        }))
    });

    const mapQuestionToFrontend = (q) => ({
        ...q,
        text: q.questionText,
        type: q.questionType,
        topic: q.topic,
        options: q.options?.map(opt => opt.optionText) || [],
        correctAnswer: q.options?.find(opt => opt.isCorrect)?.optionText || ''
    });

    const fetchData = async () => {
        if (!user || (user.role !== 'Admin' && user.role !== 'Teacher')) {
            setLoading(false);
            return;
        }
        try {
            const [examsRes, questionsRes, coursesRes] = await Promise.all([
                api.get('/exams'),
                api.get('/question-bank'),
                api.get('/courses')
            ]);
            setExams(examsRes.data);
            setQuestions((questionsRes.data || []).map(mapQuestionToFrontend));
            setCourses(coursesRes.data || []);
        } catch (err) {
            console.error("Failed to fetch admin exam/question data:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTopics = async (courseId = '') => {
        try {
            const res = await api.get(`/question-bank/topics${courseId ? `?courseId=${courseId}` : ''}`);
            return res.data;
        } catch (err) {
            console.error("Failed to fetch topics:", err);
            return [];
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [user?.id, user?.role]);

    // Question Actions
    const addQuestion = async (question) => {
        try {
            const payload = mapQuestionToBackend(question);
            const res = await api.post('/question-bank', payload);
            setQuestions([mapQuestionToFrontend(res.data), ...questions]);
        } catch (err) {
            console.error("Failed to add question:", err);
        }
    };

    const updateQuestion = async (id, updatedData) => {
        try {
            const payload = mapQuestionToBackend(updatedData);
            const res = await api.put(`/question-bank/${id}`, payload);
            setQuestions(questions.map(q => q.id === id ? mapQuestionToFrontend(res.data) : q));
        } catch (err) {
            console.error("Failed to update question:", err);
        }
    };

    const deleteQuestion = async (id) => {
        try {
            await api.delete(`/question-bank/${id}`);
            setQuestions(questions.filter(q => q.id !== id));
        } catch (err) {
            console.error("Failed to delete question:", err);
        }
    };

    // Exam Actions
    const addExam = async (exam) => {
        try {
            const res = await api.post('/exams', { ...exam, status: 'Draft' });
            setExams([res.data, ...exams]);
        } catch (err) {
            console.error("Failed to add exam:", err);
        }
    };

    const updateExam = async (id, updatedData) => {
        try {
            const res = await api.put(`/exams/${id}`, updatedData);
            setExams(exams.map(e => e.id === id ? res.data : e));
        } catch (err) {
            console.error("Failed to update exam:", err);
        }
    };

    const deleteExam = async (id) => {
        try {
            await api.delete(`/exams/${id}`);
            setExams(exams.filter(e => e.id !== id));
        } catch (err) {
            console.error("Failed to delete exam:", err);
        }
    };

    const approveExam = async (id, notes) => {
        try {
            const res = await api.put(`/exams/${id}/approve`, { notes });
            setExams(exams.map(e => e.id === id ? res.data.exam : e));
        } catch (err) {
            console.error("Failed to approve exam:", err);
        }
    };

    const rejectExam = async (id, notes) => {
        try {
            const res = await api.put(`/exams/${id}/reject`, { notes });
            setExams(exams.map(e => e.id === id ? res.data.exam : e));
        } catch (err) {
            console.error("Failed to reject exam:", err);
        }
    };

    return (
        <AdminExamContext.Provider value={{
            questions,
            exams,
            courses,
            loading,
            fetchTopics,
            addQuestion,
            updateQuestion,
            deleteQuestion,
            addExam,
            updateExam,
            deleteExam,
            approveExam,
            rejectExam,
            // Exam-Question Logic
            addQuestionToSection: async (examId, sectionId, questionId) => {
                const exam = exams.find(e => e.id === examId);
                if (!exam) return;
                const updatedSections = (exam.sections || []).map(section => {
                    if (section.id === sectionId) {
                        if (section.questions.includes(questionId)) return section;
                        return { ...section, questions: [...section.questions, questionId] };
                    }
                    return section;
                });
                await updateExam(examId, { sections: updatedSections });
            },
            removeQuestionFromSection: async (examId, sectionId, questionId) => {
                const exam = exams.find(e => e.id === examId);
                if (!exam) return;
                const updatedSections = (exam.sections || []).map(section => {
                    if (section.id === sectionId) {
                        return { ...section, questions: section.questions.filter(id => id !== questionId) };
                    }
                    return section;
                });
                await updateExam(examId, { sections: updatedSections });
            },
            duplicateExam: async (examId) => {
                const examToCopy = exams.find(e => e.id === examId);
                if (!examToCopy) return;

                const newExamPayload = {
                    ...examToCopy,
                    id: undefined, // Let backend generate new UUID
                    title: `Copy of ${examToCopy.title}`,
                    status: 'Draft',
                    versions: [],
                    lastSaved: new Date().toISOString()
                };
                await addExam(newExamPayload);
            },

            saveExamDraft: async (examId, updatedData) => {
                await updateExam(examId, {
                    ...updatedData,
                    lastSaved: new Date().toISOString()
                });
            },

            publishExam: async (examId) => {
                const exam = exams.find(e => e.id === examId);
                if (!exam) return;
                const newVersion = {
                    version: (exam.versions?.length || 0) + 1,
                    date: new Date().toISOString(),
                    changedBy: 'Admin',
                    snapshot: 'Published Version'
                };
                await updateExam(examId, {
                    status: 'Published',
                    versions: [...(exam.versions || []), newVersion],
                    lastSaved: new Date().toISOString()
                });
            },

            validateExam: (exam) => {
                const errors = [];
                if (!exam.title) errors.push("Exam title is required.");
                if (!exam.sections || exam.sections.length === 0) errors.push("At least one section is required.");
                if (exam.sections && exam.sections.some(s => s.questions.length === 0)) errors.push("All sections must have questions.");
                if (!exam.timeLimit || exam.timeLimit <= 0) errors.push("Valid time limit is required.");

                const calcTotal = exam.sections?.reduce((sum, s) => sum + (s.questions.length * s.marksPerQuestion), 0) || 0;
                if (calcTotal !== exam.totalMarks) {
                    errors.push(`Total marks mismatch: Calculated ${calcTotal}, set as ${exam.totalMarks}`);
                }

                return errors;
            },

            getExamQuestions: (examId) => {
                const exam = exams.find(e => e.id === examId);
                if (!exam) return {};

                const questionMap = {};
                (exam.sections || []).forEach(section => {
                    questionMap[section.id] = (section.questions || []).map(qId => questions.find(q => q.id === qId)).filter(Boolean);
                });
                return questionMap;
            }
        }}>
            {children}
        </AdminExamContext.Provider>
    );
};
