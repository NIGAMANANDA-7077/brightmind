import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import { Hash, FileText, Clock, PlayCircle, Loader2, CheckCircle } from 'lucide-react';
import PageTransition from '../../components/common/PageTransition';

const Exams = () => {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const res = await api.get('/exams');
                // Filter exams that are active and scheduled date has arrived (or is within the window)
                const now = new Date();
                const activeExams = res.data.filter(e => {
                    if (e.status !== 'Active') return false;
                    const scheduled = new Date(e.scheduledAt);
                    const expires = new Date(e.expiresAt);
                    return now >= scheduled && now <= expires;
                });
                setExams(activeExams);
            } catch (err) {
                console.error("Failed to fetch exams:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchExams();
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
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Exams & Quizzes</h1>
                    <p className="text-gray-500 mt-1">Participate in live exams during their scheduled windows</p>
                </div>

                {exams.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {exams.map(exam => {
                            const expires = new Date(exam.expiresAt);
                            const timeLeftMs = expires.getTime() - new Date().getTime();
                            const minutesLeft = Math.max(0, Math.floor(timeLeftMs / 60000));

                            return (
                                <div key={exam.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                                            <PlayCircle size={24} />
                                        </div>
                                        <span className="px-3 py-1 bg-red-50 text-red-600 font-bold text-xs rounded-full flex items-center gap-1">
                                            <Clock size={14} /> Ends in {minutesLeft}m
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{exam.title}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 font-medium mb-6">
                                        <div className="flex items-center gap-1">
                                            <Clock size={16} /> {exam.duration} mins
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Hash size={16} /> {exam.totalMarks} Marks
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/student/exam/${exam.id}`)}
                                        className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all bg-[#8b5cf6] text-white hover:bg-[#7c3aed] shadow-lg shadow-purple-500/20 active:scale-95"
                                    >
                                        <PlayCircle size={18} /> Start Attempt
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <FileText className="mx-auto text-gray-300 mb-4" size={48} />
                        <h3 className="text-lg font-bold text-gray-900">No Live Exams</h3>
                        <p className="text-gray-500 font-medium max-w-xs mx-auto mt-2">There are no exams currently active in your time window. Stay tuned for announcements!</p>
                    </div>
                )}
            </div>
        </PageTransition>
    );
};

export default Exams;
