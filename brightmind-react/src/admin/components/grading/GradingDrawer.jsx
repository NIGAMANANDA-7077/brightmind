import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, CheckCircle, FileText, Lock, Eye, Download } from 'lucide-react';
import { useAdminResults } from '../../context/AdminResultsContext';

const GradingDrawer = ({ isOpen, submission, onClose }) => {
    const { updateSubmissionGrade, publishSubmission } = useAdminResults();
    const [activeTab, setActiveTab] = useState('Final');
    const [marks, setMarks] = useState({ written: {}, assignment: 0 });
    const [comments, setComments] = useState({ written: {}, assignment: '' });
    const [overrideTotal, setOverrideTotal] = useState(null);

    useEffect(() => {
        if (submission) {
            // Initialize local state from submission
            const initialWrittenMarks = {};
            const initialWrittenComments = {};
            if (submission.writtenAnswers) {
                submission.writtenAnswers.forEach(ans => {
                    initialWrittenMarks[ans.q] = ans.marks || 0;
                    initialWrittenComments[ans.q] = ans.comment || '';
                });
            }

            setMarks({
                written: initialWrittenMarks,
                assignment: submission.scores.assignment || 0
            });
            setComments({
                written: initialWrittenComments,
                assignment: submission.assignmentComments || ''
            });
            setOverrideTotal(submission.finalScore); // Or calculate default
        }
    }, [submission]);

    const calculateTotals = useMemo(() => {
        if (!submission) return { omr: 0, written: 0, assignment: 0, total: 0 };

        const omr = submission.scores.omr || 0;
        const assignment = parseInt(marks.assignment) || 0;
        const written = Object.values(marks.written).reduce((sum, m) => sum + (parseInt(m) || 0), 0);

        return {
            omr,
            assignment,
            written,
            total: omr + assignment + written
        };
    }, [submission, marks]);

    const handleSaveDraft = () => {
        const updatedScores = {
            omr: submission.scores.omr,
            assignment: calculateTotals.assignment,
            written: calculateTotals.written
        };
        const finalScore = overrideTotal !== null ? parseInt(overrideTotal) : calculateTotals.total;

        updateSubmissionGrade(submission.id, {
            scores: updatedScores,
            finalScore: finalScore,
            assignmentComments: comments.assignment
            // In real app, would also save written comments/marks structure
        });
        alert('Draft saved!');
        onClose();
    };

    const handlePublish = () => {
        const updatedScores = {
            omr: submission.scores.omr,
            assignment: calculateTotals.assignment,
            written: calculateTotals.written
        };
        const finalScore = overrideTotal !== null ? parseInt(overrideTotal) : calculateTotals.total;

        publishSubmission(submission.id, {
            scores: updatedScores,
            finalScore: finalScore,
            assignmentComments: comments.assignment
        });
        onClose();
    };

    if (!isOpen || !submission) return null;

    const isPublished = submission.status === 'Published';

    return (
        <>
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            ></div>

            <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white shadow-2xl z-50 transform transition-transform animate-slideInRight flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Grading: {submission.studentName}</h2>
                        <p className="text-sm text-gray-500">{submission.examName}</p>
                    </div>
                    <button onClick={onClose}><X size={24} className="text-gray-400 hover:text-gray-600" /></button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 px-6">
                    {['OMR', 'Written', 'Assignment', 'Final'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === tab ? 'border-[#8b5cf6] text-[#8b5cf6]' : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">

                    {/* OMR TAB */}
                    {activeTab === 'OMR' && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800">
                                <h4 className="font-bold flex items-center gap-2"><CheckCircle size={18} /> Auto-Graded</h4>
                                <p className="text-sm mt-1">OMR sheets are automatically processed by the system.</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-900">{submission.omrData?.correct}</div>
                                        <div className="text-xs text-green-600 font-bold uppercase">Correct</div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-900">{submission.omrData?.wrong}</div>
                                        <div className="text-xs text-red-500 font-bold uppercase">Wrong</div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                                    <p className="text-gray-500 text-sm font-medium">Total OMR Score</p>
                                    <p className="text-4xl font-bold text-[#8b5cf6] mt-1">{submission.scores.omr}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* WRITTEN TAB */}
                    {activeTab === 'Written' && (
                        <div className="space-y-6">
                            {submission.writtenAnswers?.map((qa, idx) => (
                                <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-gray-900 text-sm">Q{qa.q}: {qa.question}</h4>
                                        <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">Max: {qa.maxMarks}</span>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 italic border border-gray-100 mb-4">
                                        "{qa.answer}"
                                    </div>
                                    <div className="flex gap-4 items-end">
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Marks</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max={qa.maxMarks}
                                                disabled={isPublished}
                                                value={marks.written[qa.q] || 0}
                                                onChange={(e) => setMarks(prev => ({
                                                    ...prev,
                                                    written: { ...prev.written, [qa.q]: e.target.value }
                                                }))}
                                                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none"
                                            />
                                        </div>
                                        <div className="flex-[3]">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Comment</label>
                                            <input
                                                type="text"
                                                disabled={isPublished}
                                                value={comments.written[qa.q] || ''}
                                                onChange={(e) => setComments(prev => ({
                                                    ...prev,
                                                    written: { ...prev.written, [qa.q]: e.target.value }
                                                }))}
                                                placeholder="Feedback..."
                                                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!submission.writtenAnswers || submission.writtenAnswers.length === 0) && (
                                <p className="text-center text-gray-500 italic py-8">No written questions in this exam.</p>
                            )}
                        </div>
                    )}

                    {/* ASSIGNMENT TAB */}
                    {activeTab === 'Assignment' && (
                        <div className="space-y-6">
                            {submission.assignmentFiles?.length > 0 ? (
                                <div className="space-y-3">
                                    <h4 className="font-bold text-gray-900">Submitted Files</h4>
                                    {submission.assignmentFiles.map((file, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl hover:border-[#8b5cf6]/30 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{file.name}</p>
                                                    <p className="text-xs text-gray-500">{file.size}</p>
                                                </div>
                                            </div>
                                            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><Download size={18} /></button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 italic py-4">No files uploaded.</p>
                            )}

                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Assignment Marks</label>
                                    <input
                                        type="number"
                                        disabled={isPublished}
                                        value={marks.assignment}
                                        onChange={(e) => setMarks(prev => ({ ...prev, assignment: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none font-bold text-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Overall Feedback</label>
                                    <textarea
                                        rows={3}
                                        disabled={isPublished}
                                        value={comments.assignment}
                                        onChange={(e) => setComments(prev => ({ ...prev, assignment: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none"
                                        placeholder="General comments on the assignment..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* FINAL TAB */}
                    {activeTab === 'Final' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <table className="w-full text-sm">
                                    <tbody className="divide-y divide-gray-100">
                                        <tr className="bg-gray-50/50">
                                            <td className="px-4 py-3 font-medium text-gray-600">OMR Score</td>
                                            <td className="px-4 py-3 font-bold text-gray-900 text-right">{calculateTotals.omr}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 font-medium text-gray-600">Written Score</td>
                                            <td className="px-4 py-3 font-bold text-gray-900 text-right">{calculateTotals.written}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 font-medium text-gray-600">Assignment Score</td>
                                            <td className="px-4 py-3 font-bold text-gray-900 text-right">{calculateTotals.assignment}</td>
                                        </tr>
                                        <tr className="bg-[#8b5cf6]/5">
                                            <td className="px-4 py-4 font-bold text-[#8b5cf6]">Calculated Total</td>
                                            <td className="px-4 py-4 font-bold text-[#8b5cf6] text-right text-lg">{calculateTotals.total}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Override Final Score (Variables, Extra Credit, etc.)</label>
                                <input
                                    type="number"
                                    disabled={isPublished}
                                    value={overrideTotal !== null ? overrideTotal : calculateTotals.total}
                                    onChange={(e) => setOverrideTotal(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none font-bold text-2xl text-center"
                                />
                                <p className="text-xs text-gray-400 mt-2 text-center">Leave default or modify manual override.</p>
                            </div>

                            {isPublished ? (
                                <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center font-bold flex items-center justify-center gap-2">
                                    <Lock size={18} />
                                    Results Published & Locked
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleSaveDraft}
                                        className="w-full py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        Save Draft
                                    </button>
                                    <button
                                        onClick={handlePublish}
                                        className="w-full py-3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20"
                                    >
                                        Publish Results
                                    </button>
                                    <p className="text-xs text-center text-gray-400">Publishing will make results visible to students and lock editing.</p>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </>
    );
};

export default GradingDrawer;
