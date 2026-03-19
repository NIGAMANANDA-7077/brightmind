import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../../components/common/PageTransition';
import AssignmentCard from '../../components/student/assignments/AssignmentCard';
import { useAssignment } from '../../context/AssignmentContext';

const Assignments = () => {
    const { assignments } = useAssignment();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');

    const filters = ['All', 'Pending', 'Submitted', 'Late', 'Graded'];

    const filteredAssignments = filter === 'All'
        ? assignments
        : assignments.filter(a => a.status === filter);

    return (
        <PageTransition>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
                        <p className="text-gray-500 mt-1">Track your tasks and submissions</p>
                    </div>

                    <div className="flex bg-gray-50 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                        {filters.map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${filter === f
                                    ? 'bg-white text-[#8b5cf6] shadow-sm'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredAssignments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredAssignments.map(assignment => (
                            <div key={assignment.id} className="relative group">
                                <AssignmentCard assignment={assignment} />
                                {/* Overlay link since we can't easily modify AssignmentCard internal link without rewrite */}
                                <div
                                    onClick={() => navigate(`/student/assignment/${assignment.id}`)}
                                    className="absolute inset-0 z-10 cursor-pointer"
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <p className="text-gray-500 font-medium">No assignments found in this category.</p>
                    </div>
                )}
            </div>
        </PageTransition>
    );
};

export default Assignments;
