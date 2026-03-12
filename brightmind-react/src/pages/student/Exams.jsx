import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import { Hash, FileText, Clock, PlayCircle, Loader2, CheckCircle, BarChart3, AlertCircle } from 'lucide-react';
import PageTransition from '../../components/common/PageTransition';

const Exams = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Available Exams');
    const [exams, setExams] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [examsRes, resultsRes] = await Promise.all([
                api.get('/exams/student'),
                api.get('/exams/results/student')
            ]);
            
            // Filter out exams that the student has already taken by cross-referencing results
            const takenExamIds = new Set(resultsRes.data.results.map(r => r.examId));
            const availableExams = (examsRes.data || []).filter(e => !takenExamIds.has(e.id));
            
            setExams(availableExams);
            setResults(resultsRes.data.results || []);
        } catch (err) {
            console.error("Failed to fetch student exams data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#8b5cf6]" size={40} />
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="space-y-8 pb-10">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Exams & Quizzes</h1>
                    <p className="text-gray-500 mt-1">Participate in live exams and track your performance</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
                    {['Available Exams', 'My Results'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                                activeTab === tab 
                                    ? 'bg-white text-[#8b5cf6] shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'Available Exams' ? (
                    exams.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {exams.map(exam => (
                                <div key={exam.id} className="bg-white p-6 rounded-3xl flex flex-col justify-between shadow-sm border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all group">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                                <FileText size={24} />
                                            </div>
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 font-bold text-xs rounded-full flex items-center gap-1">
                                                <Clock size={12} /> Live
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{exam.title}</h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-500 font-medium mb-6 bg-gray-50 p-3 rounded-xl">
                                            <div className="flex items-center gap-1.5 flex-1">
                                                <Clock size={16} className="text-purple-400" /> {exam.duration}m
                                            </div>
                                            <div className="w-px h-6 bg-gray-200"></div>
                                            <div className="flex items-center gap-1.5 flex-1 justify-end">
                                                <Hash size={16} className="text-purple-400" /> {exam.totalMarks} Marks
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/student/exam/${exam.id}`)}
                                        className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all bg-gray-50 text-gray-700 hover:bg-[#8b5cf6] hover:text-white group-hover:shadow-lg group-hover:shadow-purple-500/25 active:scale-95"
                                    >
                                        <PlayCircle size={18} /> Take Exam Now
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                            <CheckCircle className="mx-auto text-green-400 mb-4" size={48} />
                            <h3 className="text-xl font-bold text-gray-900">All Caught Up!</h3>
                            <p className="text-gray-500 font-medium max-w-xs mx-auto mt-2">There are no pending exams for your enrolled courses right now.</p>
                        </div>
                    )
                ) : (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100 font-bold text-sm text-gray-600">
                                <tr>
                                    <th className="px-6 py-4">Exam Title</th>
                                    <th className="px-6 py-4">Required</th>
                                    <th className="px-6 py-4">Your Score</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Taken On</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {results.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                            <BarChart3 size={40} className="mx-auto mb-3 opacity-20" />
                                            No results available
                                        </td>
                                    </tr>
                                ) : (
                                    results.map(res => (
                                        <tr key={res.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-900">{res.exam?.title || 'Unknown Exam'}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-500">{res.exam?.passingMarks || 33}% to pass</td>
                                            <td className="px-6 py-4 font-bold text-purple-600">{res.obtainedMarks} / {res.totalMarks}</td>
                                            <td className="px-6 py-4">
                                                {res.status === 'pass' ? (
                                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold">Passed</span>
                                                ) : res.status === 'fail' ? (
                                                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs font-bold">Failed</span>
                                                ) : (
                                                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-xs font-bold">Pending Review</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">{new Date(res.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </PageTransition>
    );
};

export default Exams;
