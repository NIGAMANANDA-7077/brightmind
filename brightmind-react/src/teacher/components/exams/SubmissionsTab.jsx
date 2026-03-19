import React, { useState, useEffect } from 'react';
import api from '../../../utils/axiosConfig';
import { Loader2, CheckCircle, Lock } from 'lucide-react';

const SubmissionsTab = ({ courses, exams }) => {
    const [selectedExamId, setSelectedExamId] = useState('');
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [publishing, setPublishing] = useState(false);

    const selectedExam = exams.find(e => e.id === selectedExamId);
    const isPublished = selectedExam?.status === 'Completed';

    const fetchSubmissions = async () => {
        if (!selectedExamId) { setSubmissions([]); return; }
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

    useEffect(() => { fetchSubmissions(); }, [selectedExamId]);

    const handlePublish = async () => {
        if (isPublished) return;
        if (!window.confirm("Publish results to the leaderboard? Students will be notified. This cannot be undone.")) return;
        setPublishing(true);
        try {
            const res = await api.post(`/exams/${selectedExamId}/publish`);
            alert(res.data.message || "Results published successfully! Students have been notified.");
            fetchSubmissions();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to publish.");
        } finally {
            setPublishing(false);
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
                    {exams.map(ex => (
                        <option key={ex.id} value={ex.id}>
                            {ex.title} {ex.status === 'Completed' ? '✅ Published' : `(${ex.status})`}
                        </option>
                    ))}
                </select>

                {selectedExamId && (
                    <div className="flex items-center gap-3">
                        {isPublished ? (
                            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl font-bold text-sm">
                                <Lock size={16} /> Results Already Published — Cannot Re-publish
                            </div>
                        ) : (
                            <button
                                onClick={handlePublish}
                                disabled={publishing || submissions.length === 0}
                                className="bg-green-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {publishing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                {publishing ? 'Publishing...' : 'Publish Results & Notify Students'}
                            </button>
                        )}
                    </div>
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
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {submissions.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-8 text-gray-400 font-medium">No submissions yet for this exam.</td></tr>
                            ) : (
                                submissions.map(sub => (
                                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900">{sub.student?.name || '—'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{sub.student?.email || '—'}</td>
                                        <td className="px-6 py-4">
                                            {sub.status === 'evaluated' ? (
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-bold">Evaluated</span>
                                            ) : (
                                                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg text-xs font-bold">Submitted</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-purple-600">{sub.totalScore?.toFixed(2) ?? 0}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{sub.submitTime ? new Date(sub.submitTime).toLocaleString() : '—'}</td>
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
