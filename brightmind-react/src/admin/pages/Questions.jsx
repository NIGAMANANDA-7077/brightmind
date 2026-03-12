import React, { useState, useEffect } from 'react';
import { Search, Plus, Upload, Filter, MoreVertical, Edit, Trash2, Database, FileText, CheckSquare, AlignLeft, ShieldCheck, Globe } from 'lucide-react';
import QuestionFormModal from '../components/questions/QuestionFormModal';
import BulkImportModal from '../components/questions/BulkImportModal';
import AddToExamModal from '../components/questions/AddToExamModal';
import { useAdminExams } from '../context/AdminExamContext';
import { useUser } from '../../context/UserContext';

const Questions = () => {
    const { questions, deleteQuestion, fetchTopics } = useAdminExams();
    const { user } = useUser();
    const [searchTerm, setSearchTerm] = useState('');
    const [topicFilter, setTopicFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
    const [availableTopics, setAvailableTopics] = useState([]);

    useEffect(() => {
        const loadTopics = async () => {
            const list = await fetchTopics();
            setAvailableTopics(list);
        };
        loadTopics();
    }, [questions]);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isAddToExamOpen, setIsAddToExamOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [selectedQuestionForExam, setSelectedQuestionForExam] = useState(null);

    // Permission check
    const canManageQuestion = (q) => {
        if (user?.role === 'Admin') return true;
        return q.teacherId === user?.id;
    };

    // Filter Logic
    const filteredQuestions = questions.filter(q => {
        const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.topic.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTopic = topicFilter === 'All' || q.topic === topicFilter;
        const matchesType = typeFilter === 'All' || q.type === typeFilter;
        return matchesSearch && matchesTopic && matchesType;
    });

    const handleEdit = (question) => {
        setEditingQuestion(question);
        setIsFormOpen(true);
    };

    const handleAddToExam = (question) => {
        setSelectedQuestionForExam(question);
        setIsAddToExamOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Delete this question?')) {
            deleteQuestion(id);
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'bg-green-100 text-green-700';
            case 'Medium': return 'bg-yellow-100 text-yellow-700';
            case 'Hard': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
                    <p className="text-gray-500">Manage and organize your question repository</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsImportOpen(true)}
                        className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                        <Upload size={20} />
                        Bulk Import
                    </button>
                    <button
                        onClick={() => { setEditingQuestion(null); setIsFormOpen(true); }}
                        className="flex items-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-purple-500/20"
                    >
                        <Plus size={20} />
                        Add Question
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search questions by text or topic..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    <select
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 text-gray-600"
                        value={topicFilter}
                        onChange={(e) => setTopicFilter(e.target.value)}
                    >
                        <option value="All">All Topics</option>
                        {availableTopics.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                    <select
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 text-gray-600"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="All">All Types</option>
                        <option value="MCQ">MCQ</option>
                        <option value="Written">Written</option>
                    </select>
                </div>
            </div>

            {/* Questions Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/2">Question</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Topic</th>
                                <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Difficulty</th>
                                <th className="text-center py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Marks</th>
                                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredQuestions.map((q) => (
                                <tr key={q.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="py-4 px-6 border-b border-gray-100">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-gray-900 line-clamp-1">{q.text}</p>
                                                {!q.teacherId && (
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">
                                                        <Globe size={10} /> SHARED
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">Topic: {q.topic}</p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700">
                                            {q.topic}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        {q.type === 'MCQ' ? (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600">
                                                <CheckSquare size={14} className="text-blue-500" /> MCQ
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600">
                                                <AlignLeft size={14} className="text-orange-500" /> Written
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getDifficultyColor(q.difficulty)}`}>
                                            {q.difficulty}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-center text-sm font-bold text-gray-700">
                                        {q.marks}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleAddToExam(q)}
                                                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                title="Add to Exam"
                                            >
                                                <Plus size={16} />
                                            </button>
                                            {canManageQuestion(q) && (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(q)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(q.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredQuestions.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-gray-300" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No questions found</h3>
                        <p className="text-gray-500">Try adjusting your search or add a new question.</p>
                    </div>
                )}
            </div>

            {/* Modals */}
            {isFormOpen && (
                <QuestionFormModal
                    isOpen={isFormOpen}
                    onClose={() => setIsFormOpen(false)}
                    initialData={editingQuestion}
                />
            )}

            {isImportOpen && (
                <BulkImportModal
                    isOpen={isImportOpen}
                    onClose={() => setIsImportOpen(false)}
                />
            )}

            {isAddToExamOpen && (
                <AddToExamModal
                    isOpen={isAddToExamOpen}
                    onClose={() => setIsAddToExamOpen(false)}
                    question={selectedQuestionForExam}
                />
            )}
        </div>
    );
};

export default Questions;
