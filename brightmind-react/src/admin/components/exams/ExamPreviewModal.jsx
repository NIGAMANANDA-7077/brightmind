import React from 'react';
import { X, CheckCircle, AlertTriangle, Clock, Layers, HelpCircle } from 'lucide-react';
import { useAdminExams } from '../../context/AdminExamContext';

const ExamPreviewModal = ({ isOpen, exam, onClose, onPublish }) => {
    const { validateExam } = useAdminExams();
    const errors = validateExam(exam ? exam : {});

    if (!isOpen || !exam) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity"
                onClick={onClose}
            ></div>

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scaleUp">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">Exam Preview</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">

                        {/* Validation Warnings */}
                        {errors.length > 0 ? (
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                                <h4 className="flex items-center gap-2 font-bold text-red-700 mb-2">
                                    <AlertTriangle size={18} />
                                    Validation Issues
                                </h4>
                                <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                                    {errors.map((err, idx) => <li key={idx}>{err}</li>)}
                                </ul>
                                <p className="text-xs text-red-500 mt-2 font-medium">Please fix these issues before publishing.</p>
                            </div>
                        ) : (
                            <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-2 text-green-700 font-bold">
                                <CheckCircle size={20} />
                                Exam is valid and ready to publish.
                            </div>
                        )}

                        {/* Summary Card */}
                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-4 text-lg">{exam.title}</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500 block">Course</span>
                                    <span className="font-bold text-gray-900">{exam.course}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">Total Marks</span>
                                    <span className="font-bold text-gray-900">{exam.totalMarks}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-gray-400" />
                                    <span className="font-bold text-gray-700">{exam.timeLimit} min</span>
                                </div>
                                <div>
                                    <span className="text-gray-500 block">Negative Marking</span>
                                    <span className="font-bold text-gray-900">{exam.negativeMarking ? 'Yes' : 'No'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Sections Breakdown */}
                        <div className="space-y-3">
                            <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                <Layers size={18} /> Sections Breakdown
                            </h4>
                            {exam.sections.map((section, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-white">
                                    <div>
                                        <span className="font-bold text-gray-800">{section.name}</span>
                                        <p className="text-xs text-gray-500">{section.marksPerQuestion} marks/question</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg text-sm font-bold text-gray-600">
                                        <HelpCircle size={14} />
                                        {section.questions.length} Questions
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3 rounded-b-2xl">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 font-bold text-gray-500 hover:bg-gray-200/50 rounded-xl transition-colors"
                        >
                            Keep Editing
                        </button>
                        <button
                            onClick={onPublish}
                            disabled={errors.length > 0}
                            className={`px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2
                                ${errors.length > 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                                    : 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/20'}
                            `}
                        >
                            {errors.length > 0 ? 'Fix Issues to Publish' : 'Confirm & Publish'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ExamPreviewModal;
