import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminExams } from '../context/AdminExamContext';
import { Search, Plus, FileText, Clock, MoreVertical, Edit, Play, Copy } from 'lucide-react';

const Exams = () => {
    const { exams, duplicateExam } = useAdminExams();
    const navigate = useNavigate();


    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Exams</h1>
                    <p className="text-gray-500">Manage your OMR exams and tests</p>
                </div>
                <Link
                    to="/admin/exams/create"
                    className="flex items-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-purple-500/20"
                >
                    <Plus size={20} />
                    Create Exam
                </Link>
            </div>

            {/* Filters (Mock) */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search exams..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
                    />
                </div>
                <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 text-gray-600 w-full md:w-auto cursor-pointer">
                    <option>All Courses</option>
                    <option>Physics</option>
                    <option>Math</option>
                </select>
                <select className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 text-gray-600 w-full md:w-auto cursor-pointer">
                    <option>All Status</option>
                    <option>Draft</option>
                    <option>Published</option>
                </select>
            </div>

            {/* Exams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map((exam) => (
                    <div key={exam.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${exam.status === 'Published' ? 'bg-green-100 text-green-600' : exam.status === 'Draft' ? 'bg-gray-100 text-gray-500' : 'bg-orange-100 text-orange-600'}`}>
                                <FileText size={24} />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => duplicateExam(exam.id)}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                                    title="Duplicate Exam"
                                >
                                    <Copy size={20} />
                                </button>
                                {/* Edit Button is handled below, but maybe quick link here? */}
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{exam.title}</h3>
                        <p className="text-sm text-gray-500 mb-4">{exam.course}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                            <div className="flex items-center gap-1.5">
                                <Clock size={16} className="text-gray-400" />
                                <span>{exam.timeLimit} min</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold">{exam.totalMarks}</span>
                                <span className="text-gray-400">Marks</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-4 border-t border-gray-50">
                            <Link
                                to={`/admin/exams/edit/${exam.id}`}
                                className="flex-1 px-4 py-2 bg-purple-50 text-[#8b5cf6] rounded-lg text-sm font-bold hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <Edit size={16} /> Edit
                            </Link>
                            {exam.status === 'Draft' ? (
                                <button className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                                    <Play size={16} /> Publish
                                </button>
                            ) : (
                                <Link
                                    to={`/admin/exams/${exam.id}/submissions`}
                                    className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FileText size={16} /> Submissions
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Exams;
