import React, { useState } from 'react';
import { useAdminExams } from '../../context/AdminExamContext';
import { Search, Plus, Trash2, Filter, ChevronRight } from 'lucide-react';

const StepQuestionPicker = ({ data, updateData }) => {
    const { questions } = useAdminExams();
    const [activeSectionId, setActiveSectionId] = useState(data.sections[0]?.id);
    const [searchTerm, setSearchTerm] = useState('');

    const activeSection = data.sections.find(s => s.id === activeSectionId);

    // Logic to add question to section
    const handleAddQuestion = (questionId) => {
        if (!activeSection) return;

        // Check if question is already in current section
        if (activeSection.questions.includes(questionId)) return;

        const updatedSections = data.sections.map(s => {
            if (s.id === activeSectionId) {
                return { ...s, questions: [...s.questions, questionId] };
            }
            return s;
        });
        updateData({ ...data, sections: updatedSections });
    };

    const handleRemoveQuestion = (questionId) => {
        if (!activeSection) return;

        const updatedSections = data.sections.map(s => {
            if (s.id === activeSectionId) {
                return { ...s, questions: s.questions.filter(id => id !== questionId) };
            }
            return s;
        });
        updateData({ ...data, sections: updatedSections });
    };

    // Filter available questions (exclude ones already in this section for cleaner view, or show "Added" badge)
    const availableQuestions = questions.filter(q =>
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-[600px] animate-fadeIn">
            {/* Left: Section Selector & Current Section Questions */}
            <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50">
                <div className="p-4 border-b border-gray-200">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Select Section</label>
                    <select
                        value={activeSectionId}
                        onChange={(e) => setActiveSectionId(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:outline-none font-medium"
                    >
                        {data.sections.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.questions.length} Qs)</option>
                        ))}
                    </select>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <h3 className="text-sm font-bold text-gray-900">Added to {activeSection?.name}</h3>
                    {activeSection?.questions.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No questions added yet.</p>
                    ) : (
                        activeSection?.questions.map((qId, index) => {
                            const q = questions.find(item => item.id === qId);
                            if (!q) return null;
                            return (
                                <div key={qId} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-start justify-between group">
                                    <div className="flex-1">
                                        <span className="text-xs font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded mr-2">Q{index + 1}</span>
                                        <p className="text-sm text-gray-900 line-clamp-2">{q.text}</p>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveQuestion(qId)}
                                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Right: Question Bank */}
            <div className="w-2/3 flex flex-col bg-white">
                <div className="p-4 border-b border-gray-100 flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search Question Bank..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20"
                        />
                    </div>
                    <button className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100">
                        <Filter size={16} /> Filters
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {availableQuestions.map(q => {
                        const isAdded = activeSection?.questions.includes(q.id);
                        return (
                            <div key={q.id} className={`p-4 rounded-xl border transition-all ${isAdded ? 'bg-purple-50 border-purple-200' : 'bg-white border-gray-100 hover:border-purple-300'}`}>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 mb-1">{q.text}</p>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                {q.difficulty}
                                            </span>
                                            <span className="text-xs text-gray-500">{q.topic}</span>
                                            <span className="text-xs text-gray-500">{q.type}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => !isAdded && handleAddQuestion(q.id)}
                                        disabled={isAdded}
                                        className={`p-2 rounded-lg transition-colors flex-shrink-0 ${isAdded
                                                ? 'bg-purple-200 text-purple-700 cursor-default'
                                                : 'bg-gray-100 text-gray-600 hover:bg-[#8b5cf6] hover:text-white'
                                            }`}
                                    >
                                        {isAdded ? <Check size={18} /> : <Plus size={18} />}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// Simple icon component to avoid undefined error if Check wasn't imported
const Check = ({ size }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export default StepQuestionPicker;
