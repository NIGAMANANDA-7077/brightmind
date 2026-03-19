import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import api from '../../utils/axiosConfig';
import { Loader2 } from 'lucide-react';

import ExamsTab from '../../teacher/components/exams/ExamsTab';
import SubmissionsTab from '../../teacher/components/exams/SubmissionsTab';

const AdminExams = () => {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState('All Exams');
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const [coursesRes, batchesRes, examsRes] = await Promise.all([
                api.get('/courses'),
                api.get('/batches'),
                api.get('/exams/teacher') // Admin bypasses teacherId filter in the controller
            ]);
            setCourses(coursesRes.data || []);
            setBatches(Array.isArray(batchesRes.data) ? batchesRes.data : batchesRes.data?.batches || []);
            // /exams/teacher returns a direct array
            setExams(Array.isArray(examsRes.data) ? examsRes.data : []);
        } catch (err) {
            console.error("Failed to fetch admin exam context:", err);
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
                    <h1 className="text-2xl font-bold text-gray-900">Global Exam Engine</h1>
                    <p className="text-gray-500">Manage all Exams and Submissions platform-wide</p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
                {['All Exams', 'Review Submissions'].map(tab => (
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
            {activeTab === 'All Exams' && <ExamsTab courses={courses} batches={batches} />}
            {activeTab === 'Review Submissions' && <SubmissionsTab courses={courses} exams={exams} />}
        </div>
    );
};

export default AdminExams;
