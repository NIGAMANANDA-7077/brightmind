import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, Save } from 'lucide-react';
import { useAdminExams } from '../../context/AdminExamContext';

const QuestionFormModal = ({ isOpen, onClose, initialData = null }) => {
    const { addQuestion, updateQuestion } = useAdminExams();

    const [formData, setFormData] = useState({
        text: '',
        type: 'MCQ',
        topic: 'Physics',
        difficulty: 'Medium',
        marks: 1,
        options: ['', '', '', ''],
        correctAnswer: '',
        explanation: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (initialData) {
            updateQuestion(initialData.id, formData);
        } else {
            addQuestion(formData);
        }
        onClose();
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData({ ...formData, options: newOptions });
    };

    const addOption = () => {
        setFormData({ ...formData, options: [...formData.options, ''] });
    };

    const removeOption = (index) => {
        const newOptions = formData.options.filter((_, i) => i !== index);
        setFormData({ ...formData, options: newOptions });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10">
                    <h2 className="text-xl font-bold text-gray-900">
                        {initialData ? 'Edit Question' : 'Create New Question'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Main Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Question Text</label>
                            <textarea
                                required
                                rows="3"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all resize-none"
                                placeholder="Enter your question here..."
                                value={formData.text}
                                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Topic</label>
                            <select
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
                                value={formData.topic}
                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                            >
                                <option value="Physics">Physics</option>
                                <option value="Chemistry">Chemistry</option>
                                <option value="Math">Math</option>
                                <option value="Biology">Biology</option>
                                <option value="General">General</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty</label>
                            <select
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
                                value={formData.difficulty}
                                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                            >
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                            <select
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="MCQ">Multiple Choice (MCQ)</option>
                                <option value="Written">Written / Subjective</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Marks</label>
                            <input
                                type="number"
                                min="1"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
                                value={formData.marks}
                                onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    {/* Types Specific Logic */}
                    {formData.type === 'MCQ' && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-bold text-gray-700">Options & Correct Answer</label>
                                <button type="button" onClick={addOption} className="text-xs font-semibold text-[#8b5cf6] hover:underline">+ Add Option</button>
                            </div>

                            {formData.options.map((option, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="flex-1 relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                        <input
                                            type="text"
                                            required
                                            className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${formData.correctAnswer === option && option !== ''
                                                    ? 'border-green-500 ring-green-500/20 bg-green-50'
                                                    : 'border-gray-200 focus:ring-[#8b5cf6]/20 bg-white'
                                                }`}
                                            placeholder={`Option ${index + 1}`}
                                            value={option}
                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, correctAnswer: option })}
                                        className={`p-2 rounded-lg transition-colors ${formData.correctAnswer === option && option !== ''
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                                            }`}
                                        title="Mark as correct"
                                    >
                                        <Check size={18} />
                                    </button>

                                    {formData.options.length > 2 && (
                                        <button type="button" onClick={() => removeOption(index)} className="text-gray-400 hover:text-red-500">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Explanation */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Explanation (Optional)</label>
                        <textarea
                            rows="2"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all resize-none"
                            placeholder="Why is the answer correct?"
                            value={formData.explanation}
                            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-[#8b5cf6] text-white rounded-xl font-bold hover:bg-[#7c3aed] transition-all flex items-center gap-2"
                        >
                            <Save size={18} />
                            Save Question
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuestionFormModal;
