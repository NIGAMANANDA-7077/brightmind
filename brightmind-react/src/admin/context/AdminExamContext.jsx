import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../../utils/axiosConfig';

const AdminExamContext = createContext();

export const useAdminExams = () => useContext(AdminExamContext);

export const AdminExamProvider = ({ children }) => {
    const [questions, setQuestions] = useState([]);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [examsRes, questionsRes] = await Promise.all([
                api.get('/exams'),
                api.get('/questions')
            ]);
            setExams(examsRes.data);
            setQuestions(questionsRes.data);
        } catch (err) {
            console.error("Failed to fetch admin exam/question data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Question Actions
    const addQuestion = async (question) => {
        try {
            const res = await api.post('/questions', { ...question, lastEdited: 'Just now' });
            setQuestions([res.data, ...questions]);
        } catch (err) {
            console.error("Failed to add question:", err);
        }
    };

    const updateQuestion = async (id, updatedData) => {
        try {
            const res = await api.put(`/questions/${id}`, { ...updatedData, lastEdited: 'Just now' });
            setQuestions(questions.map(q => q.id === id ? res.data : q));
        } catch (err) {
            console.error("Failed to update question:", err);
        }
    };

    const deleteQuestion = async (id) => {
        try {
            await api.delete(`/questions/${id}`);
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

    return (
        <AdminExamContext.Provider value={{
            questions,
            exams,
            loading,
            addQuestion,
            updateQuestion,
            deleteQuestion,
            addExam,
            updateExam,
            deleteExam,
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
