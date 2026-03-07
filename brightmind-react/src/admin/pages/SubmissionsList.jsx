import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminResults } from '../context/AdminResultsContext';
import { ArrowLeft, Search, Filter, CheckCircle, Clock, FileText, Calendar } from 'lucide-react';
import GradingDrawer from '../components/grading/GradingDrawer';

const SubmissionsList = () => {
    const { examId } = useParams();
    const navigate = useNavigate();
    const { getSubmissionsByExam } = useAdminResults();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    const submissions = getSubmissionsByExam(examId || 'EX001'); // Fallback to mock ID if param missing for dev

    const filteredSubmissions = submissions.filter(s =>
        s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Mock Exam Info (Ideally from another context or derived from 1st submission)
    const examInfo = submissions.length > 0 ? {
        name: submissions[0].examName,
        date: submissions[0].attemptedAt.split(' ')[0], // Simple extract
        batch: submissions[0].batch
    } : { name: 'Unknown Exam', date: 'N/A', batch: 'N/A' };

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 animate-fadeIn pb-12">

            {/* Header */}
            <div className="flex flex-col gap-4">
                <button
                    onClick={() => navigate('/admin/results')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors w-fit"
                >
                    <ArrowLeft size={20} />
                    Back to Results
                </button>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{examInfo.name} - Submissions</h1>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><Calendar size={14} /> {examInfo.date}</span>
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-bold uppercase">{examInfo.batch}</span>
                        </div>
                    </div>
                    {/* Search */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search student..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Attempted At</th>
                                <th className="py-4 px-6 text-2xl text-center text-xs font-bold text-gray-500 uppercase tracking-wider">OMR Score</th>
                                <th className="py-4 px-6 text-2xl text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Assign.</th>
                                <th className="py-4 px-6 text-2xl text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Written</th>
                                <th className="py-4 px-6 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Final Score</th>
                                <th className="py-4 px-6 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="py-4 px-6 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredSubmissions.map(sub => (
                                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div>
                                            <p className="font-bold text-gray-900">{sub.studentName}</p>
                                            <p className="text-xs text-gray-500">{sub.batch}</p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="text-gray-400" />
                                            {sub.attemptedAt}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-center font-medium text-gray-900">{sub.scores.omr}</td>
                                    <td className="py-4 px-6 text-center">
                                        {sub.assignmentFiles && sub.assignmentFiles.length > 0 ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                                                <FileText size={12} /> {sub.scores.assignment || '-'}
                                            </span>
                                        ) : <span className="text-gray-400 text-xs text-center block">-</span>}
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        {sub.writtenAnswers && sub.writtenAnswers.length > 0 ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                                                <FileText size={12} /> {sub.scores.written || '-'}
                                            </span>
                                        ) : <span className="text-gray-400 text-xs text-center block">-</span>}
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className={`font-bold text-lg ${sub.status === 'Published' ? 'text-green-600' : 'text-gray-900'}`}>{sub.finalScore}</span>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${sub.status === 'Published'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                            }`}>
                                            {sub.status === 'Published' && <CheckCircle size={12} className="mr-1" />}
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button
                                            onClick={() => setSelectedSubmission(sub)}
                                            className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-sm font-bold px-4 py-2 rounded-lg transition-all shadow-sm"
                                        >
                                            {sub.status === 'Published' ? 'View' : 'Grade'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Grading Drawer */}
            <GradingDrawer
                isOpen={!!selectedSubmission}
                submission={selectedSubmission}
                onClose={() => setSelectedSubmission(null)}
            />

        </div>
    );
};

export default SubmissionsList;
