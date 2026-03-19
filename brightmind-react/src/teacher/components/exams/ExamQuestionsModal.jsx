import React, { useState, useEffect } from 'react';
import api from '../../../utils/axiosConfig';
import { Plus, Trash2, Edit2, Check, X, Loader2, ChevronDown } from 'lucide-react';

const QUESTION_TYPES = ['MCQ', 'True False', 'Short Answer', 'Long Answer'];
const TYPE_LABELS = { MCQ: 'MCQ', 'True False': 'True/False', 'Short Answer': 'Short Answer', 'Long Answer': 'Descriptive' };

const defaultMCQOptions = () => [
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false },
];

const emptyForm = () => ({
    questionText: '',
    questionType: 'MCQ',
    marks: 1,
    options: defaultMCQOptions(),
});

const ExamQuestionsModal = ({ exam, onClose }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingEqId, setEditingEqId] = useState(null);
    const [form, setForm] = useState(emptyForm());

    const fetchQuestions = async () => {
        try {
            const res = await api.get(`/exams/${exam.id}/questions`);
            setQuestions(res.data.questions || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchQuestions(); }, [exam.id]);

    const handleTypeChange = (type) => {
        let opts = [];
        if (type === 'MCQ') opts = defaultMCQOptions();
        if (type === 'True False') opts = [
            { optionText: 'True', isCorrect: false },
            { optionText: 'False', isCorrect: false },
        ];
        setForm(f => ({ ...f, questionType: type, options: opts }));
    };

    const handleOptionText = (idx, text) => {
        setForm(f => {
            const opts = [...f.options];
            opts[idx] = { ...opts[idx], optionText: text };
            return { ...f, options: opts };
        });
    };

    const handleCorrectOption = (idx) => {
        setForm(f => ({
            ...f,
            options: f.options.map((o, i) => ({ ...o, isCorrect: i === idx }))
        }));
    };

    const handleSave = async () => {
        if (!form.questionText.trim()) return alert('Question text is required');
        if ((form.questionType === 'MCQ' || form.questionType === 'True False') && !form.options.some(o => o.isCorrect)) {
            return alert('Please mark the correct answer');
        }
        if (form.questionType === 'MCQ' && form.options.some(o => !o.optionText.trim())) {
            return alert('All 4 options must have text');
        }

        setSaving(true);
        try {
            const payload = {
                questionText: form.questionText,
                questionType: form.questionType,
                marks: parseFloat(form.marks) || 1,
                options: (form.questionType === 'MCQ' || form.questionType === 'True False') ? form.options : []
            };

            if (editingEqId) {
                await api.put(`/exams/${exam.id}/questions/${editingEqId}`, payload);
            } else {
                await api.post(`/exams/${exam.id}/questions`, payload);
            }
            setShowForm(false);
            setEditingEqId(null);
            setForm(emptyForm());
            fetchQuestions();
        } catch (err) {
            console.error(err);
            alert('Failed to save question');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (eq) => {
        setEditingEqId(eq.id);
        const q = eq.question;
        setForm({
            questionText: q.questionText,
            questionType: q.questionType,
            marks: eq.marks || q.marks || 1,
            options: q.options?.length > 0 ? q.options.map(o => ({ optionText: o.optionText, isCorrect: o.isCorrect })) : defaultMCQOptions()
        });
        setShowForm(true);
    };

    const handleDelete = async (eqId) => {
        if (!window.confirm('Remove this question?')) return;
        try {
            await api.delete(`/exams/${exam.id}/questions/${eqId}`);
            fetchQuestions();
        } catch (err) {
            console.error(err);
        }
    };

    const cancelForm = () => {
        setShowForm(false);
        setEditingEqId(null);
        setForm(emptyForm());
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{exam.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {questions.length} question{questions.length !== 1 ? 's' : ''} · {exam.totalMarks} total marks
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={18} /></button>
                </div>

                {/* Questions List */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    {loading ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-purple-500 w-6 h-6" /></div>
                    ) : questions.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <p className="font-medium">No questions yet.</p>
                            <p className="text-sm">Click "Add Question" to get started.</p>
                        </div>
                    ) : (
                        questions.map((eq, idx) => {
                            const q = eq.question;
                            return (
                                <div key={eq.id} className="border border-gray-100 rounded-2xl p-4 hover:border-purple-200 transition-colors">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold text-gray-400">Q{idx + 1}</span>
                                                <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-bold">
                                                    {TYPE_LABELS[q?.questionType] || q?.questionType}
                                                </span>
                                                <span className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                                                    {eq.marks || q?.marks || 1} mark{(eq.marks || q?.marks || 1) !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <p className="text-sm font-medium text-gray-800">{q?.questionText}</p>
                                            {q?.options?.length > 0 && (
                                                <div className="mt-2 grid grid-cols-2 gap-1">
                                                    {q.options.map((opt, oi) => (
                                                        <span key={oi} className={`text-xs px-2 py-1 rounded-lg flex items-center gap-1 ${opt.isCorrect ? 'bg-green-50 text-green-700 font-bold' : 'bg-gray-50 text-gray-600'}`}>
                                                            {opt.isCorrect && <Check size={10} />} {opt.optionText}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-1 flex-shrink-0">
                                            <button onClick={() => handleEdit(eq)} className="p-1.5 text-blue-400 hover:bg-blue-50 rounded-lg"><Edit2 size={14} /></button>
                                            <button onClick={() => handleDelete(eq.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Add Question Form */}
                    {showForm && (
                        <div className="border-2 border-purple-200 rounded-2xl p-5 bg-purple-50/40 space-y-4">
                            <h4 className="font-bold text-gray-800 text-sm">{editingEqId ? 'Edit Question' : 'New Question'}</h4>

                            {/* Question Type Selector */}
                            <div className="flex gap-2 flex-wrap">
                                {QUESTION_TYPES.map(type => (
                                    <button key={type}
                                        onClick={() => handleTypeChange(type)}
                                        className={`text-xs px-3 py-1.5 rounded-full font-bold border transition-colors ${form.questionType === type ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'}`}
                                    >
                                        {TYPE_LABELS[type]}
                                    </button>
                                ))}
                            </div>

                            {/* Question Text */}
                            <textarea
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/20 text-sm resize-none"
                                rows={3}
                                placeholder="Enter question text..."
                                value={form.questionText}
                                onChange={e => setForm(f => ({ ...f, questionText: e.target.value }))}
                            />

                            {/* MCQ Options */}
                            {form.questionType === 'MCQ' && (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-gray-600">Options (click radio to mark correct):</p>
                                    {form.options.map((opt, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleCorrectOption(i)}
                                                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${opt.isCorrect ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-400'}`}
                                            >
                                                {opt.isCorrect && <Check size={10} className="text-white" />}
                                            </button>
                                            <input
                                                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                                                placeholder={`Option ${i + 1}`}
                                                value={opt.optionText}
                                                onChange={e => handleOptionText(i, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* True/False */}
                            {form.questionType === 'True False' && (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-gray-600">Mark the correct answer:</p>
                                    {form.options.map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleCorrectOption(i)}
                                            className={`mr-2 px-5 py-2 rounded-xl text-sm font-bold border-2 transition-colors ${opt.isCorrect ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'}`}
                                        >
                                            {opt.optionText}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Marks */}
                            <div className="flex items-center gap-3">
                                <label className="text-xs font-bold text-gray-700 flex-shrink-0">Marks:</label>
                                <input
                                    type="number"
                                    min="0.5"
                                    step="0.5"
                                    className="w-24 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                                    value={form.marks}
                                    onChange={e => setForm(f => ({ ...f, marks: e.target.value }))}
                                />
                            </div>

                            <div className="flex gap-2 pt-1">
                                <button onClick={cancelForm} className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
                                <button onClick={handleSave} disabled={saving} className="px-5 py-2 text-sm font-bold text-white bg-purple-600 rounded-xl hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50">
                                    {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Check size={14} />}
                                    {editingEqId ? 'Update' : 'Add Question'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-gray-100 flex items-center justify-between flex-shrink-0 bg-gray-50">
                    {!showForm ? (
                        <button
                            onClick={() => { setForm(emptyForm()); setShowForm(true); }}
                            className="flex items-center gap-2 text-sm font-bold text-purple-600 bg-purple-50 border border-purple-200 px-4 py-2 rounded-xl hover:bg-purple-100 transition-colors"
                        >
                            <Plus size={16} /> Add Question
                        </button>
                    ) : <div />}
                    <button onClick={onClose} className="px-5 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Done</button>
                </div>
            </div>
        </div>
    );
};

export default ExamQuestionsModal;
