import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import { ChevronLeft, ChevronRight, CheckCircle, Clock, Loader2, AlertCircle } from 'lucide-react';
import PageTransition from '../../components/common/PageTransition';

const ExamTake = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    
    const [exam, setExam] = useState(null);
    const [attempt, setAttempt] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    
    // Answers state: { questionId: { selectedOptionId: '...', ... } }
    const [answers, setAnswers] = useState({});
    
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);

    const initExam = async () => {
        try {
            // 1. Fetch Exam Details
            const examRes = await api.get(`/exams/${examId}`);
            const examData = examRes.data;
            if (!examData) {
                alert('Exam not found');
                return navigate('/student/exams');
            }
            setExam(examData);
            
            const qList = examData.examQuestions.map(eq => eq.question);
            setQuestions(qList);

            // 2. Start Attempt
            try {
                const attemptRes = await api.post(`/exams/${examId}/start`);
                setAttempt(attemptRes.data.attempt);
                
                // Calculate time left based on attempt startTime and exam duration
                const start = new Date(attemptRes.data.attempt.startTime).getTime();
                const now = new Date().getTime();
                const elapsedSec = Math.floor((now - start) / 1000);
                const durationSec = examData.duration * 60;
                setTimeLeft(Math.max(0, durationSec - elapsedSec));
                
            } catch (err) {
                // If attempt already started or submitted
                if (err.response?.data?.attempt) {
                    const existing = err.response.data.attempt;
                    if (existing.status !== 'in_progress') {
                        alert("You have already submitted this exam.");
                        return navigate('/student/exams');
                    }
                    setAttempt(existing);
                    const start = new Date(existing.startTime).getTime();
                    const now = new Date().getTime();
                    const elapsedSec = Math.floor((now - start) / 1000);
                    const durationSec = examData.duration * 60;
                    setTimeLeft(Math.max(0, durationSec - elapsedSec));
                } else {
                    throw err;
                }
            }
        } catch (err) {
            console.error("Failed to initialize exam:", err);
            alert("Error loading exam");
            navigate('/student/exams');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initExam();
    }, [examId]);

    // Anti-Cheat: Tab Switch Detection
    useEffect(() => {
        if (!attempt || result || submitting) return;

        const handleVisibilityChange = async () => {
            if (document.hidden) {
                alert("WARNING: You have switched tabs or minimized the browser! This action has been recorded and flagged.");
                try {
                    await api.post(`/exams/attempt/${attempt.id}/flag`, { reason: 'Tab switched' });
                } catch (err) {
                    console.error('Failed to flag attempt:', err);
                }
            }
        };

        const handleContextMenu = (e) => e.preventDefault();
        const handleCopyPaste = (e) => {
            e.preventDefault();
            alert("Copy/Paste is disabled during the exam.");
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('copy', handleCopyPaste);
        document.addEventListener('paste', handleCopyPaste);

        // Enter fullscreen if possible
        const elem = document.documentElement;
        if (elem.requestFullscreen && !document.fullscreenElement) {
            elem.requestFullscreen().catch(() => console.log('Fullscreen rejected by user'));
        }

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopyPaste);
            document.removeEventListener('paste', handleCopyPaste);
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(err => console.log(err));
            }
        };
    }, [attempt, result, submitting]);

    // Timer
    useEffect(() => {
        if (!exam || !attempt || timeLeft <= 0 || result || submitting) return;
        const timerId = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerId);
                    handleSubmit(true); // Auto submit
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerId);
    }, [exam, attempt, timeLeft, result, submitting]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // Auto-save answer to backend when it changes
    const saveAnswerToDB = useCallback(async (questionId, answerData) => {
        if (!attempt) return;
        try {
            await api.post(`/exams/attempt/${attempt.id}/answer`, {
                questionId,
                ...answerData
            });
        } catch (err) {
            console.error("Failed to save answer silently", err);
        }
    }, [attempt]);

    const handleOptionSelect = (questionId, optionId, type) => {
        let newAnswerData = {};
        
        if (type === 'MCQ' || type === 'True False') {
            newAnswerData = { selectedOptionId: optionId };
            setAnswers(prev => ({ ...prev, [questionId]: newAnswerData }));
        } else if (type === 'Multiple Select') {
            setAnswers(prev => {
                const currentAns = prev[questionId] || { selectedOptions: [] };
                let selected = [...(currentAns.selectedOptions || [])];
                if (selected.includes(optionId)) {
                    selected = selected.filter(id => id !== optionId);
                } else {
                    selected.push(optionId);
                }
                newAnswerData = { selectedOptions: selected };
                return { ...prev, [questionId]: newAnswerData };
            });
        }
        
        // Save to DB
        // For Multiple Select, state update is async, so we use the recalculated newAnswerData
        if (type === 'Multiple Select') {
            // It uses the latest array
            // It's a bit tricky because setAnswers is async, but we have newAnswerData calculated
        }
        saveAnswerToDB(questionId, newAnswerData);
    };

    const handleTextAnswer = (questionId, text) => {
        const newAnswerData = { textAnswer: text };
        setAnswers(prev => ({ ...prev, [questionId]: newAnswerData }));
    };

    // Debounce text answer save
    useEffect(() => {
        const q = questions[currentIdx];
        if (!q) return;
        if (['Short Answer', 'Long Answer', 'Numerical'].includes(q.questionType)) {
            const timer = setTimeout(() => {
                if (answers[q.id]) {
                    saveAnswerToDB(q.id, answers[q.id]);
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [answers, currentIdx, questions, saveAnswerToDB]);

    const handleSubmit = async (autoSubmit = false) => {
        if (!exam || !attempt) return;
        if (!autoSubmit && !window.confirm('Are you sure you want to completely submit the exam? You cannot change your answers after this.')) {
            return;
        }
        
        setSubmitting(true);
        try {
            const res = await api.post(`/exams/attempt/${attempt.id}/submit`);
            setResult(res.data.attempt);
        } catch (err) {
            console.error('Submission failed', err);
            alert('Submission failed or already submitted.');
            navigate('/student/exams');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#8b5cf6]" size={40} /></div>;
    if (!exam || !attempt) return null;

    if (result) {
        return (
            <PageTransition>
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                    <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900">Exam Submitted!</h2>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center space-y-2">
                        <p className="text-gray-500 font-medium">Temporary Total Score</p>
                        <p className="text-5xl font-black text-[#8b5cf6]">{result.totalScore || 0} <span className="text-xl text-gray-400">/ {exam.totalMarks}</span></p>
                        {result.status === 'submitted' && (
                            <p className="text-sm text-yellow-600 mt-4 bg-yellow-50 p-2 rounded-lg">Some questions require manual grading by your teacher.</p>
                        )}
                    </div>
                    <button onClick={() => navigate('/student/exams')} className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors">
                        Return to Dashboard
                    </button>
                </div>
            </PageTransition>
        );
    }

    if (questions.length === 0) {
        return <div className="p-8 text-center text-gray-500">This exam has no questions configured.</div>;
    }

    const currentQuestion = questions[currentIdx];
    const qt = currentQuestion.questionType;
    const currentAns = answers[currentQuestion.id] || {};

    return (
        <PageTransition>
            <div 
                className="max-w-4xl mx-auto space-y-8 pb-20 select-none"
                onCopy={e => e.preventDefault()}
                onPaste={e => e.preventDefault()}
                onContextMenu={e => e.preventDefault()}
            >
                {/* Header Navbar */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between sticky top-4 z-10">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
                        <p className="text-sm text-gray-500 font-medium">Question {currentIdx + 1} of {questions.length}</p>
                    </div>
                    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl font-bold ${timeLeft < 300 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-purple-50 text-purple-600'}`}>
                        <Clock size={20} />
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Question Block */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-h-[400px]">
                    <div className="flex justify-between items-start mb-6">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg uppercase tracking-wider">{qt}</span>
                        <span className="font-bold text-gray-400">{currentQuestion.marks} Marks</span>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-relaxed">
                        <span className="text-[#8b5cf6] mr-2">Q{currentIdx + 1}.</span>
                        {currentQuestion.questionText}
                    </h2>

                    <div className="space-y-4">
                        {(qt === 'MCQ' || qt === 'True False') && currentQuestion.options?.map((opt, idx) => {
                            const isSelected = currentAns.selectedOptionId === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => handleOptionSelect(currentQuestion.id, opt.id, qt)}
                                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all font-medium text-lg flex items-center gap-4 ${isSelected ? 'border-[#8b5cf6] bg-purple-50 text-[#8b5cf6]' : 'border-gray-100 hover:border-gray-200 text-gray-700'}`}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-[#8b5cf6]' : 'border-gray-300'}`}>
                                        {isSelected && <div className="w-3 h-3 bg-[#8b5cf6] rounded-full" />}
                                    </div>
                                    <span className="font-bold text-gray-400 mr-2">{String.fromCharCode(65 + idx)}.</span> {opt.optionText}
                                </button>
                            );
                        })}

                        {qt === 'Multiple Select' && currentQuestion.options?.map((opt, idx) => {
                            const isSelected = (currentAns.selectedOptions || []).includes(opt.id);
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => handleOptionSelect(currentQuestion.id, opt.id, qt)}
                                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all font-medium text-lg flex items-center gap-4 ${isSelected ? 'border-[#8b5cf6] bg-purple-50 text-[#8b5cf6]' : 'border-gray-100 hover:border-gray-200 text-gray-700'}`}
                                >
                                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-[#8b5cf6] bg-[#8b5cf6]' : 'border-gray-300'}`}>
                                        {isSelected && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                    <span className="font-bold text-gray-400 mr-2">{String.fromCharCode(65 + idx)}.</span> {opt.optionText}
                                </button>
                            );
                        })}

                        {(qt === 'Short Answer' || qt === 'Numerical') && (
                            <input 
                                type={qt === 'Numerical' ? "number" : "text"}
                                className="w-full text-lg p-5 rounded-2xl border-2 border-gray-200 outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50 transition-all font-medium text-gray-800"
                                placeholder={`Type your ${qt.toLowerCase()} here...`}
                                value={currentAns.textAnswer || ''}
                                onChange={(e) => handleTextAnswer(currentQuestion.id, e.target.value)}
                            />
                        )}

                        {qt === 'Long Answer' && (
                            <textarea 
                                rows="6"
                                className="w-full text-lg p-5 rounded-2xl border-2 border-gray-200 outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-50 transition-all font-medium text-gray-800 resize-y"
                                placeholder="Type your detailed answer here..."
                                value={currentAns.textAnswer || ''}
                                onChange={(e) => handleTextAnswer(currentQuestion.id, e.target.value)}
                            />
                        )}
                    </div>
                </div>

                {/* Footer Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        disabled={currentIdx === 0}
                        onClick={() => setCurrentIdx(prev => prev - 1)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${currentIdx === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
                    >
                        <ChevronLeft size={20} /> Previous
                    </button>

                    <div className="flex gap-2">
                        {currentIdx === questions.length - 1 ? (
                            <button
                                onClick={() => handleSubmit(false)}
                                disabled={submitting}
                                className="flex items-center gap-2 px-8 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                            >
                                {submitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                                Final Submit
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentIdx(prev => prev + 1)}
                                className="flex items-center gap-2 px-6 py-3 bg-[#8b5cf6] text-white rounded-xl font-bold hover:bg-[#7c3aed] shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
                            >
                                Next <ChevronRight size={20} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Question Grid Map */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Question Map</h3>
                    <div className="flex flex-wrap gap-2">
                        {questions.map((q, idx) => {
                            const ans = answers[q.id];
                            const isAnswered = ans && (ans.selectedOptionId || (ans.selectedOptions && ans.selectedOptions.length > 0) || ans.textAnswer);
                            return (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentIdx(idx)}
                                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all flex items-center justify-center border-2 ${
                                        currentIdx === idx ? 'border-purple-600 bg-purple-100 text-purple-700' :
                                        isAnswered ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                                    }`}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>
                </div>

            </div>
        </PageTransition>
    );
};

export default ExamTake;
