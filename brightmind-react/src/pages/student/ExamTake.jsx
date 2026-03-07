import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import { ChevronLeft, ChevronRight, CheckCircle, Clock, Loader2 } from 'lucide-react';
import PageTransition from '../../components/common/PageTransition';

const ExamTake = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const fetchExamDetails = async () => {
            try {
                const res = await api.get(`/exams/${examId}`);
                const foundExam = res.data;

                if (foundExam) {
                    setExam(foundExam);
                    setTimeLeft(foundExam.duration * 60);
                } else {
                    alert('Exam not found');
                    navigate('/student/exams');
                }
            } catch (err) {
                console.error("Failed to fetch exam:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchExamDetails();
    }, [examId, navigate]);

    useEffect(() => {
        if (!exam || timeLeft <= 0 || result) return;
        const timerId = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerId);
                    handleSubmit(); // auto submit
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerId);
    }, [exam, timeLeft, result]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleAnswerSelect = (questionId, optionIndex) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    };

    const handleSubmit = async () => {
        if (!exam) return;
        if (window.confirm('Are you sure you want to submit the exam?')) {
            try {
                setSubmitting(true);
                // Convert answers map to array format expected by backend
                // { questionId: submittedAnswer } (assuming the option index or text)
                // Let's assume the backend expects { answers: [{ questionId, answer }] }
                // Backend expects { answers: { [questionId]: answerIndex } }
                const res = await api.post(`/exams/${exam.id}/submit`, { answers });
                setResult(res.data.result);
            } catch (err) {
                console.error('Submission failed', err);
                alert('Submission failed');
            } finally {
                setSubmitting(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-[#8b5cf6]" size={40} />
            </div>
        );
    }

    if (!exam) return null;

    if (result) {
        return (
            <PageTransition>
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                    <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900">Exam Submitted!</h2>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center space-y-2">
                        <p className="text-gray-500 font-medium">Your Score</p>
                        <p className="text-5xl font-black text-[#8b5cf6]">{result.score}%</p>
                    </div>
                    <button
                        onClick={() => navigate('/student/exams')}
                        className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                    >
                        Return to Exams
                    </button>
                </div>
            </PageTransition>
        );
    }

    // Support both flattened questions and sections
    const questions = exam.questions || (exam.sections && exam.sections.flatMap(s => s.questions)) || [];
    if (questions.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                This exam has no questions configured.
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <PageTransition>
            <div className="max-w-4xl mx-auto space-y-8 pb-20">
                {/* Header */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between sticky top-4 z-10">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
                        <p className="text-sm text-gray-500 font-medium">Question {currentQuestionIndex + 1} of {questions.length}</p>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold">
                        <Clock size={20} />
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-relaxed">
                        <span className="text-[#8b5cf6] mr-2">Q{currentQuestionIndex + 1}.</span>
                        {currentQuestion.questionText}
                    </h2>

                    <div className="space-y-4">
                        {currentQuestion.options && currentQuestion.options.map((option, idx) => {
                            const isSelected = answers[currentQuestion.id] === idx;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswerSelect(currentQuestion.id, idx)}
                                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all font-medium text-lg flex items-center gap-4 ${isSelected
                                        ? 'border-[#8b5cf6] bg-purple-50 text-[#8b5cf6]'
                                        : 'border-gray-100 hover:border-gray-200 text-gray-700'
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-[#8b5cf6]' : 'border-gray-300'
                                        }`}>
                                        {isSelected && <div className="w-3 h-3 bg-[#8b5cf6] rounded-full" />}
                                    </div>
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Navigation and Submit */}
                <div className="flex items-center justify-between">
                    <button
                        disabled={currentQuestionIndex === 0}
                        onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${currentQuestionIndex === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <ChevronLeft size={20} /> Previous
                    </button>

                    {currentQuestionIndex === questions.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 px-8 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                            Submit Exam
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                            className="flex items-center gap-2 px-6 py-3 bg-[#8b5cf6] text-white rounded-xl font-bold hover:bg-[#7c3aed] shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
                        >
                            Next <ChevronRight size={20} />
                        </button>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default ExamTake;
