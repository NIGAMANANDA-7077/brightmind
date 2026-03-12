import React, { useState, useEffect } from 'react';
import api from '../../../utils/axiosConfig';
import { Loader2, Eye, CheckCircle } from 'lucide-react';

const SubmissionsTab = ({ courses, exams }) => {
    const [selectedExamId, setSelectedExamId] = useState('');
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchSubmissions = async () => {
        if (!selectedExamId) {
            setSubmissions([]);
            return;
        }
        setLoading(true);
        try {
            const res = await api.get(`/exams/${selectedExamId}/submissions`);
            setSubmissions(res.data.attempts || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, [selectedExamId]);

    const handlePublish = async () => {
        if (!window.confirm("Publish results to the leaderboard and notify students?")) return;
        try {
            await api.post(`/exams/${selectedExamId}/publish`);
            alert("Results published successfully!");
            fetchSubmissions();
        } catch (err) {
            console.error(err);
            alert("Failed to publish.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <label className="block text-sm font-bold text-gray-700">Select Exam to Review</label>
                <select 
                    className="w-full md:w-1/2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/20"
                    value={selectedExamId}
                    onChange={e => setSelectedExamId(e.target.value)}
                >
                    <option value="">Choose an exam...</option>
                    {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title}</option>)}
                </select>
                
                {selectedExamId && submissions.length > 0 && (
                    <button onClick={handlePublish} className="mt-4 bg-green-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20">
                        <CheckCircle size={18} /> Publish Results to Leaderboard
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-purple-500 w-8 h-8" /></div>
            ) : selectedExamId ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 font-bold text-sm text-gray-600">
                            <tr>
                                <th className="px-6 py-4">Student Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Total Score</th>
                                <th className="px-6 py-4">Submitted At</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {submissions.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-8 text-gray-400 font-medium">No submissions yet for this exam.</td></tr>
                            ) : (
                                submissions.map(sub => (
                                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900">{sub.student?.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{sub.student?.email}</td>
                                        <td className="px-6 py-4">
                                            {sub.status === 'evaluated' ? (
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-bold">Evaluated</span>
                                            ) : (
                                                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg text-xs font-bold">Needs Review</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-purple-600">{sub.totalScore?.toFixed(2) || 0}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(sub.submitTime).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-blue-500 hover:bg-blue-50 text-sm font-bold flex items-center gap-1 rounded-lg ml-auto">
                                                <Eye size={16} /> Review
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ) : null}
        </div>
    );
};

export default SubmissionsTab;
