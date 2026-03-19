import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { useBatch } from '../../context/BatchContext';
import api from '../../utils/axiosConfig';
import { Loader2 } from 'lucide-react';

import ExamsTab from '../components/exams/ExamsTab';
import SubmissionsTab from '../components/exams/SubmissionsTab';

const Exams = () => {
    const { user } = useUser();
    const { myBatches } = useBatch();
    const [activeTab, setActiveTab] = useState('My Exams');
    const [courses, setCourses] = useState([]);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const [coursesRes, examsRes] = await Promise.all([
                api.get('/courses'),
                api.get('/exams/teacher')
            ]);
            setCourses(coursesRes.data || []);
            setExams(examsRes.data || []);
        } catch (err) {
            console.error("Failed to fetch teacher exam context:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user?.id]);

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#8b5cf6]" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Exam Manager</h1>
                    <p className="text-gray-500">Create exams for your batches, add questions, and review student submissions</p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
                {['My Exams', 'Review Submissions'].map(tab => (
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

            {/* Tab Content */}
            {activeTab === 'My Exams' && <ExamsTab courses={courses} batches={myBatches} />}
            {activeTab === 'Review Submissions' && <SubmissionsTab courses={courses} exams={exams} />}
        </div>
    );
};

export default Exams;
