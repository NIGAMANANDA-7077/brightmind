import React, { useState, useEffect } from 'react';
import api from '../../../utils/axiosConfig';
import { Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';

const QuestionBankTab = ({ courses }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCourse, setFilterCourse] = useState('');
    const [showModal, setShowModal] = useState(false);
    
    // Form state
    const [form, setForm] = useState({
        courseId: '',
        topic: '',
        questionText: '',
        questionType: 'MCQ',
        difficulty: 'Medium',
        marks: 1,
        negativeMarks: 0,
        explanation: '',
        options: [
            { optionText: '', isCorrect: true },
            { optionText: '', isCorrect: false },
            { optionText: '', isCorrect: false },
            { optionText: '', isCorrect: false }
        ]
    });
    const [availableTopics, setAvailableTopics] = useState([]);
    const [topicFilter, setTopicFilter] = useState('');

    const fetchTopics = async () => {
        try {
            const res = await api.get(`/question-bank/topics${filterCourse ? `?courseId=${filterCourse}` : ''}`);
            setAvailableTopics(res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/question-bank${filterCourse ? `?courseId=${filterCourse}` : ''}`);
            setQuestions(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
        fetchTopics();
    }, [filterCourse, questions.length]); // Re-fetch topics if count changes

    const handleEditClick = (q) => {
        setForm({
            id: q.id,
            courseId: q.courseId || '',
            topic: q.topic || '',
            questionText: q.questionText || '',
            questionType: q.questionType || 'MCQ',
            difficulty: q.difficulty || 'Medium',
            marks: q.marks || 1,
            negativeMarks: q.negativeMarks || 0,
            explanation: q.explanation || '',
            options: q.options && q.options.length > 0 ? q.options.map(o => ({...o})) : [
                { optionText: '', isCorrect: true },
                { optionText: '', isCorrect: false },
                { optionText: '', isCorrect: false },
                { optionText: '', isCorrect: false }
            ]
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            // Clean up options based on type
            let payloadOptions = form.options;
            if (['Short Answer', 'Long Answer', 'Numerical'].includes(form.questionType)) {
                payloadOptions = [];
            } else if (form.questionType === 'True False') {
                payloadOptions = [
                    { optionText: 'True', isCorrect: form.options[0].isCorrect },
                    { optionText: 'False', isCorrect: !form.options[0].isCorrect }
                ];
            }

            const payload = { ...form, options: payloadOptions };
            
            if (form.id) {
                await api.put(`/question-bank/${form.id}`, payload);
            } else {
                await api.post('/question-bank', payload);
            }
            setShowModal(false);
            fetchQuestions();
        } catch (err) {
            console.error(err);
            alert('Failed to save question');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this question?")) return;
        try {
            await api.delete(`/question-bank/${id}`);
            fetchQuestions();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-purple-500" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex gap-4">
                    <select 
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500/20"
                        value={filterCourse}
                        onChange={(e) => setFilterCourse(e.target.value)}
                    >
                        <option value="">All Courses</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>

                    <select 
                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-purple-500/20"
                        value={topicFilter}
                        onChange={(e) => setTopicFilter(e.target.value)}
                    >
                        <option value="">All Topics</option>
                        {availableTopics.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <button 
                    onClick={() => {
                        setForm({
                            id: null,
                            courseId: filterCourse || (courses[0]?.id || ''),
                            questionText: '',
                            questionType: 'MCQ',
                            difficulty: 'Medium',
                            marks: 1,
                            negativeMarks: 0,
                            explanation: '',
                            options: [
                                { optionText: '', isCorrect: true },
                                { optionText: '', isCorrect: false },
                                { optionText: '', isCorrect: false },
                                { optionText: '', isCorrect: false }
                            ]
                        });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-[#8b5cf6] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#7c3aed] transition-colors shadow-lg shadow-purple-500/20"
                >
                    <Plus size={18} /> Add Question
                </button>
            </div>

            <div className="space-y-4">
                {questions.filter(q => !topicFilter || q.topic === topicFilter).length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <p className="text-gray-500">No questions found matching your criteria.</p>
                    </div>
                ) : (
                    questions.filter(q => !topicFilter || q.topic === topicFilter).map(q => (
                        <div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-bold px-2 py-1 bg-purple-100 text-purple-700 rounded-lg">{q.questionType}</span>
                                        <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-lg">{q.topic || 'General'}</span>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${q.difficulty==='Easy'?'bg-green-100 text-green-700':q.difficulty==='Medium'?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'}`}>{q.difficulty}</span>
                                        <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-700 rounded-lg">{q.marks} Marks</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900">{q.questionText}</h4>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEditClick(q)} className="p-2 text-blue-400 hover:bg-blue-50 rounded-xl transition-colors"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(q.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={18} /></button>
                                </div>
                            </div>
                            
                            {/* Options preview */}
                            {q.options && q.options.length > 0 && (
                                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-50">
                                    {q.options.map((opt, idx) => (
                                        <div key={opt.id} className={`p-3 rounded-xl border text-sm ${opt.isCorrect ? 'border-green-200 bg-green-50 text-green-800 font-medium' : 'border-gray-100 bg-gray-50 text-gray-600'}`}>
                                            {String.fromCharCode(65 + idx)}. {opt.optionText}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Question Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">{form.id ? 'Edit Question' : 'Add Question'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">✕</button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4 flex-1">
                            {/* Form Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Course</label>
                                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" value={form.courseId} onChange={e => setForm({...form, courseId: e.target.value})}>
                                        <option value="">Select Course...</option>
                                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Question Type</label>
                                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" value={form.questionType} onChange={e => setForm({...form, questionType: e.target.value})}>
                                        <option value="MCQ">Multiple Choice (MCQ)</option>
                                        <option value="Multiple Select">Multiple Select</option>
                                        <option value="True False">True / False</option>
                                        <option value="Short Answer">Short Answer</option>
                                        <option value="Long Answer">Long Answer</option>
                                        <option value="Numerical">Numerical</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Topic</label>
                                <input 
                                    list="topics-list-teacher"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" 
                                    value={form.topic} 
                                    onChange={e => setForm({...form, topic: e.target.value})} 
                                    placeholder="e.g. Algebra, Organic Chemistry..." 
                                />
                                <datalist id="topics-list-teacher">
                                    {availableTopics.map(t => <option key={t} value={t} />)}
                                </datalist>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Question Text</label>
                                <textarea rows="3" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" value={form.questionText} onChange={e => setForm({...form, questionText: e.target.value})} placeholder="What is the capital of France?" />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty</label>
                                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}>
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Marks</label>
                                    <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" value={form.marks} onChange={e => setForm({...form, marks: parseFloat(e.target.value)})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Negative Marks</label>
                                    <input type="number" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" value={form.negativeMarks} onChange={e => setForm({...form, negativeMarks: parseFloat(e.target.value)})} />
                                </div>
                            </div>

                            {/* Options block for MCQ */}
                            {form.questionType === 'MCQ' && (
                                <div className="space-y-3 mt-4 pt-4 border-t border-gray-100">
                                    <label className="block text-sm font-bold text-gray-700">Options (Check the correct one)</label>
                                    {form.options.map((opt, idx) => (
                                        <div key={idx} className="flex gap-3 items-center">
                                            <input 
                                                type="radio" 
                                                name="correctOption" 
                                                checked={opt.isCorrect} 
                                                onChange={() => {
                                                    const newOpts = form.options.map((o, i) => ({ ...o, isCorrect: i === idx }));
                                                    setForm({...form, options: newOpts});
                                                }}
                                                className="w-5 h-5 text-purple-600"
                                            />
                                            <input 
                                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 outline-none"
                                                placeholder={`Option ${String.fromCharCode(65+idx)}`}
                                                value={opt.optionText}
                                                onChange={e => {
                                                    const newOpts = [...form.options];
                                                    newOpts[idx].optionText = e.target.value;
                                                    setForm({...form, options: newOpts});
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {form.questionType === 'True False' && (
                                <div className="space-y-3 mt-4 pt-4 border-t border-gray-100">
                                    <label className="block text-sm font-bold text-gray-700">Correct Answer</label>
                                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none" value={form.options[0].isCorrect ? 'true' : 'false'} onChange={e => {
                                        const newOpts = [...form.options];
                                        newOpts[0].isCorrect = e.target.value === 'true';
                                        setForm({...form, options: newOpts});
                                    }}>
                                        <option value="true">True</option>
                                        <option value="false">False</option>
                                    </select>
                                </div>
                            )}

                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-3 font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">Cancel</button>
                            <button onClick={handleSave} className="flex-1 py-3 font-bold text-white bg-[#8b5cf6] rounded-xl hover:bg-[#7c3aed] transition-colors shadow-lg shadow-purple-500/20">{form.id ? 'Update Question' : 'Save Question'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionBankTab;
