import React, { useState, useEffect, useRef } from 'react';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, Flag, RotateCcw, AlertTriangle } from 'lucide-react';

const OMRQuestionCard = ({ question, selectedOption, onSelectOption, onMarkReview, isReview }) => {
    return (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-start mb-6">
                <span className="text-gray-500 font-bold text-sm uppercase tracking-wider">Question {question.index + 1}</span>
                {isReview && (
                    <span className="flex items-center gap-1 text-yellow-500 font-bold text-xs bg-yellow-50 px-2 py-1 rounded-lg">
                        <Flag size={12} fill="currentColor" /> Marked for review
                    </span>
                )}
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-8 leading-relaxed">
                {question.text}
            </h3>

            <div className="space-y-4 flex-1">
                {question.options.map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSelectOption(idx)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 group ${selectedOption === idx
                                ? 'border-[#8b5cf6] bg-[#8b5cf6]/5'
                                : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-colors ${selectedOption === idx
                                ? 'bg-[#8b5cf6] border-[#8b5cf6] text-white'
                                : 'border-gray-300 text-gray-500 group-hover:border-gray-400'
                            }`}>
                            {String.fromCharCode(65 + idx)}
                        </div>
                        <span className={`font-medium ${selectedOption === idx ? 'text-[#8b5cf6]' : 'text-gray-700'}`}>
                            {option}
                        </span>
                    </button>
                ))}
            </div>

            <div className="pt-8 mt-8 border-t border-gray-100 flex justify-between">
                <button
                    onClick={onMarkReview}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-colors ${isReview ? 'text-yellow-500 bg-yellow-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    <Flag size={18} fill={isReview ? "currentColor" : "none"} />
                    {isReview ? 'Unmark for Review' : 'Mark for Review'}
                </button>
                <button
                    onClick={() => onSelectOption(null)}
                    className="text-red-400 hover:text-red-500 font-bold text-sm px-4 py-2 hover:bg-red-50 rounded-xl transition-colors"
                >
                    Clear Selection
                </button>
            </div>
        </div>
    );
};

const QuestionPalette = ({ totalQuestions, currentQuestion, answers, reviewMarks, onNavigate }) => {
    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col">
            <h3 className="font-bold text-gray-900 mb-4">Question Palette</h3>

            <div className="grid grid-cols-5 gap-2 content-start flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {Array.from({ length: totalQuestions }).map((_, idx) => {
                    const isAnswered = answers[idx] !== undefined && answers[idx] !== null;
                    const isReview = reviewMarks[idx];
                    const isCurrent = currentQuestion === idx;

                    let bgClass = 'bg-gray-100 text-gray-500 border-gray-200'; // Not visited
                    if (isCurrent) bgClass = 'ring-2 ring-offset-2 ring-[#8b5cf6] border-[#8b5cf6] bg-white text-[#8b5cf6] font-extrabold';
                    else if (isReview) bgClass = 'bg-yellow-100 text-yellow-700 border-yellow-300';
                    else if (isAnswered) bgClass = 'bg-green-100 text-green-700 border-green-300';
                    else if (idx < currentQuestion) bgClass = 'bg-blue-50 text-blue-600 border-blue-200'; // Visited but skipped

                    return (
                        <button
                            key={idx}
                            onClick={() => onNavigate(idx)}
                            className={`w-full aspect-square rounded-xl flex items-center justify-center text-sm font-bold border ${bgClass} transition-all`}
                        >
                            {idx + 1}
                            {isReview && <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-yellow-500"></div>}
                        </button>
                    );
                })}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs text-gray-500 font-medium">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-100 border border-green-300"></div> Answered</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-300"></div> Marked Review</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-200"></div> Not Visited</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-white border border-[#8b5cf6] ring-2 ring-[#8b5cf6]/20"></div> Current</div>
            </div>
        </div>
    );
};

const ExamResult = ({ assignment, onRetake }) => {
    const { submission, totalMarks, questions } = assignment;
    const { answers, score } = submission;

    // Calculate stats
    const totalQ = questions.length;
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    questions.forEach((q, idx) => {
        if (answers[idx] === q.correctAnswer) correct++;
        else if (answers[idx] === undefined || answers[idx] === null) skipped++;
        else wrong++;
    });

    const percentage = Math.round((score / totalMarks) * 100);
    const isPassed = percentage >= 60; // Mock pass criteria

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Score Card */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl overflow-hidden relative">
                <div className={`absolute top-0 left-0 w-full h-2 ${isPassed ? 'bg-green-500' : 'bg-red-500'}`}></div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Exam Result</h2>
                        <p className="text-gray-500">Assignment: {assignment.title}</p>

                        <div className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl font-bold text-sm ${isPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {isPassed ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                            {isPassed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="text-center">
                            <div className="text-4xl font-black text-gray-900">{score}/{totalMarks}</div>
                            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Score</div>
                        </div>
                        <div className="w-px h-16 bg-gray-100 hidden md:block"></div>
                        <div className="text-center">
                            <div className={`text-4xl font-black ${percentage >= 60 ? 'text-green-500' : 'text-red-500'}`}>{percentage}%</div>
                            <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Percentage</div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-100">
                    <div className="p-4 bg-green-50 rounded-2xl text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">{correct}</div>
                        <div className="text-xs font-bold text-green-800/60 uppercase">Correct</div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-2xl text-center">
                        <div className="text-2xl font-bold text-red-600 mb-1">{wrong}</div>
                        <div className="text-xs font-bold text-red-800/60 uppercase">Wrong</div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl text-center">
                        <div className="text-2xl font-bold text-gray-600 mb-1">{skipped}</div>
                        <div className="text-xs font-bold text-gray-500 uppercase">Skipped</div>
                    </div>
                </div>
            </div>

            {/* Answer Key */}
            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-bold text-gray-900">Detailed Review</h3>
                </div>
                <div>
                    {questions.map((q, idx) => {
                        const userAnswer = answers[idx];
                        const isCorrect = userAnswer === q.correctAnswer;
                        const isSkipped = userAnswer === undefined || userAnswer === null;

                        return (
                            <div key={q.id} className="p-6 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold text-gray-400 text-sm">Q{idx + 1}.</span>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${isCorrect ? 'bg-green-100 text-green-700' :
                                                    isSkipped ? 'bg-gray-200 text-gray-600' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {isCorrect ? 'Correct' : isSkipped ? 'Skipped' : 'Wrong'}
                                            </span>
                                        </div>
                                        <p className="font-bold text-gray-900 mb-4">{q.text}</p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="block text-gray-400 text-xs font-bold uppercase mb-1">Your Answer</span>
                                                <div className={`p-3 rounded-xl border font-medium ${isCorrect ? 'bg-green-50 border-green-200 text-green-800' :
                                                        isSkipped ? 'bg-gray-50 border-gray-200 text-gray-500' : 'bg-red-50 border-red-200 text-red-800'
                                                    }`}>
                                                    {isSkipped ? 'Not Answered' : q.options[userAnswer]}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="block text-gray-400 text-xs font-bold uppercase mb-1">Correct Answer</span>
                                                <div className="p-3 rounded-xl border border-green-200 bg-green-50 text-green-800 font-medium">
                                                    {q.options[q.correctAnswer]}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 p-4 bg-blue-50/50 rounded-xl text-sm border border-blue-100">
                                            <span className="font-bold text-blue-800 block mb-1">Explanation:</span>
                                            <p className="text-blue-900/80">{q.explanation}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const OMRExam = ({ assignment, onSubmit }) => {
    // If already graded, show result
    if (assignment.status === 'Graded') {
        return <ExamResult assignment={assignment} />;
    }

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [reviewMarks, setReviewMarks] = useState({});
    const [timeLeft, setTimeLeft] = useState(assignment.timeLimit * 60); // seconds
    const [isStarted, setIsStarted] = useState(false);

    useEffect(() => {
        let timer;
        if (isStarted && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isStarted) {
            handleSubmitExam(); // Auto submit
        }
        return () => clearInterval(timer);
    }, [isStarted, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleSelectOption = (optionIdx) => {
        setAnswers(prev => ({ ...prev, [currentQuestion]: optionIdx }));
    };

    const handleMarkReview = () => {
        setReviewMarks(prev => ({ ...prev, [currentQuestion]: !prev[currentQuestion] }));
    };

    const handleSubmitExam = () => {
        // Calculate score
        let score = 0;
        const marksPerQ = assignment.totalMarks / assignment.questions.length;

        assignment.questions.forEach((q, idx) => {
            if (answers[idx] === q.correctAnswer) {
                score += marksPerQ;
            }
        });

        onSubmit(answers, Math.round(score));
    };

    if (!isStarted) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                    <Clock size={48} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{assignment.title}</h2>
                <div className="flex items-center justify-center gap-6 mb-8 text-gray-500">
                    <span className="flex items-center gap-2 font-medium bg-gray-100 px-4 py-2 rounded-lg">
                        <Flag size={18} /> {assignment.questions.length} Questions
                    </span>
                    <span className="flex items-center gap-2 font-medium bg-gray-100 px-4 py-2 rounded-lg">
                        <Clock size={18} /> {assignment.timeLimit} Minutes
                    </span>
                </div>
                <p className="text-gray-500 mb-10 max-w-md mx-auto">
                    This is a timed exam. Once you start, the timer will count down.
                    You can mark questions for review and come back to them anytime before submitting.
                </p>
                <button
                    onClick={() => setIsStarted(true)}
                    className="px-10 py-4 bg-[#8b5cf6] text-white rounded-2xl font-bold text-lg hover:bg-[#7c3aed] transition-all shadow-xl shadow-purple-500/30 active:scale-95"
                >
                    Start Exam
                </button>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col">
            {/* Exam Header */}
            <div className="bg-gray-900 text-white p-4 rounded-xl flex items-center justify-between mb-4 shadow-lg shrink-0">
                <div className="font-bold text-lg max-w-md truncate">{assignment.title}</div>
                <div className={`font-mono text-xl font-bold flex items-center gap-2 ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    <Clock size={20} />
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Main Exam Area */}
            <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
                {/* Question Area */}
                <div className="flex-1 flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto mb-4 custom-scrollbar">
                        <OMRQuestionCard
                            question={{ ...assignment.questions[currentQuestion], index: currentQuestion }}
                            selectedOption={answers[currentQuestion]}
                            onSelectOption={handleSelectOption}
                            onMarkReview={handleMarkReview}
                            isReview={reviewMarks[currentQuestion]}
                        />
                    </div>

                    {/* Navigation Footer */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shrink-0">
                        <button
                            disabled={currentQuestion === 0}
                            onClick={() => setCurrentQuestion(prev => prev - 1)}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={20} /> Previous
                        </button>

                        {currentQuestion === assignment.questions.length - 1 ? (
                            <button
                                onClick={handleSubmitExam}
                                className="flex items-center gap-2 px-8 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 active:scale-95"
                            >
                                <CheckCircle size={20} /> Submit Exam
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentQuestion(prev => prev + 1)}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                            >
                                Next Question <ChevronRight size={20} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Question Palette Sidebar */}
                <div className="w-full md:w-80 h-full shrink-0 hidden md:block">
                    <QuestionPalette
                        totalQuestions={assignment.questions.length}
                        currentQuestion={currentQuestion}
                        answers={answers}
                        reviewMarks={reviewMarks}
                        onNavigate={setCurrentQuestion}
                    />
                </div>
            </div>
        </div>
    );
};

export default OMRExam;
