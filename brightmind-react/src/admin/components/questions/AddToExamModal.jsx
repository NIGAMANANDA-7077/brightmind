import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useAdminExams } from '../../context/AdminExamContext';

const AddToExamModal = ({ isOpen, onClose, question }) => {
    const { exams, addQuestionToSection } = useAdminExams();
    const [selectedExamId, setSelectedExamId] = useState('');
    const [selectedSectionId, setSelectedSectionId] = useState('');

    const draftExams = exams.filter(e => e.status === 'Draft');
    const selectedExam = draftExams.find(e => e.id.toString() === selectedExamId);

    const handleSave = () => {
        if (selectedExamId && selectedSectionId) {
            addQuestionToSection(parseInt(selectedExamId), selectedSectionId, question.id);
            alert('Question added to exam successfully!');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Add to Exam</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="font-medium text-gray-900 line-clamp-2">{question?.text}</p>
                        <div className="flex gap-2 mt-2 text-xs text-gray-500">
                            <span className="bg-white px-2 py-1 rounded border border-gray-200">{question?.topic}</span>
                            <span className="bg-white px-2 py-1 rounded border border-gray-200">{question?.type}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Select Exam</label>
                        <select
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none"
                            value={selectedExamId}
                            onChange={(e) => {
                                setSelectedExamId(e.target.value);
                                setSelectedSectionId('');
                            }}
                        >
                            <option value="">Select Draft Exam...</option>
                            {draftExams.map(exam => (
                                <option key={exam.id} value={exam.id}>{exam.title}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Select Section</label>
                        <select
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                            value={selectedSectionId}
                            onChange={(e) => setSelectedSectionId(e.target.value)}
                            disabled={!selectedExamId}
                        >
                            <option value="">Select Section...</option>
                            {selectedExam?.sections.map(section => (
                                <option key={section.id} value={section.id}>{section.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">Cancel</button>
                    <button
                        onClick={handleSave}
                        disabled={!selectedExamId || !selectedSectionId}
                        className="px-6 py-2 bg-[#8b5cf6] text-white rounded-xl font-bold hover:bg-[#7c3aed] transition-colors shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add to Exam
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddToExamModal;
