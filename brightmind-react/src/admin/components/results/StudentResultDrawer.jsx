import React, { useState, useEffect } from 'react';
import { X, Save, User, BookOpen, Clock, Calendar } from 'lucide-react';
import { useAdminResults } from '../../context/AdminResultsContext';

const StudentResultDrawer = ({ isOpen, onClose, result }) => {
    const { updateStudentMarks } = useAdminResults();
    const [scores, setScores] = useState({
        omrScore: 0,
        assignmentScore: 0,
        quizScore: 0
    });

    useEffect(() => {
        if (result) {
            setScores({
                omrScore: result.omrScore,
                assignmentScore: result.assignmentScore,
                quizScore: result.quizScore
            });
        }
    }, [result]);

    const handleSave = () => {
        if (result) {
            updateStudentMarks(result.id, scores);
            // Show toast here if you have a toast system
            alert("Marks updated successfully! (Mock)");
            onClose();
        }
    };

    if (!isOpen || !result) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl z-50 transform transition-transform animate-slideInRight flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{result.studentName}</h2>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                            <span className="bg-white border border-gray-200 px-2 py-0.5 rounded text-xs font-bold text-gray-600">{result.studentId}</span>
                            <span>•</span>
                            <span>{result.batch}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Exam Info Card */}
                    <div className="bg-[#8b5cf6]/5 p-5 rounded-2xl border border-[#8b5cf6]/10">
                        <div className="flex items-start justify-between">
                            <div>
                                <h4 className="font-bold text-[#8b5cf6]">{result.examName}</h4>
                                <p className="text-sm text-gray-600 mt-1">{result.course}</p>
                            </div>
                            <div className="text-right">
                                <span className="block text-2xl font-bold text-gray-900">{result.totalScore}</span>
                                <span className={`text-xs font-bold uppercase tracking-wider
                                    ${result.status === 'Pass' ? 'text-green-600' : 'text-red-500'}
                                `}>
                                    {result.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Edit Marks Section */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <BookOpen size={18} />
                            Detailed Scoring
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">OMR Score</label>
                                <input
                                    type="number"
                                    value={scores.omrScore}
                                    onChange={(e) => setScores(prev => ({ ...prev, omrScore: e.target.value }))}
                                    className="w-full text-lg font-bold text-gray-900 border-b-2 border-gray-200 focus:border-[#8b5cf6] outline-none py-1 transition-colors"
                                />
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Assignment Score</label>
                                <input
                                    type="number"
                                    value={scores.assignmentScore}
                                    onChange={(e) => setScores(prev => ({ ...prev, assignmentScore: e.target.value }))}
                                    className="w-full text-lg font-bold text-gray-900 border-b-2 border-gray-200 focus:border-[#8b5cf6] outline-none py-1 transition-colors"
                                />
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quiz Score</label>
                                <input
                                    type="number"
                                    value={scores.quizScore}
                                    onChange={(e) => setScores(prev => ({ ...prev, quizScore: e.target.value }))}
                                    className="w-full text-lg font-bold text-gray-900 border-b-2 border-gray-200 focus:border-[#8b5cf6] outline-none py-1 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* History Section */}
                    {result.history && result.history.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Clock size={18} />
                                Past History
                            </h3>
                            <div className="space-y-3">
                                {result.history.map((h, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-bold text-gray-700 text-sm">{h.examName}</p>
                                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                                <Calendar size={10} /> {h.date}
                                            </p>
                                        </div>
                                        <span className="font-bold text-gray-900">{h.score}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 font-bold text-gray-500 hover:bg-gray-200/50 rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-8 py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 flex items-center gap-2 transition-all"
                    >
                        <Save size={18} />
                        Update Marks
                    </button>
                </div>
            </div>
        </>
    );
};

export default StudentResultDrawer;
