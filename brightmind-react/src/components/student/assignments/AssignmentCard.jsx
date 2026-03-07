import React from 'react';
import { Calendar, CheckCircle, AlertCircle, FileText, Upload } from 'lucide-react';

const AssignmentCard = ({ assignment }) => {
    const statusConfig = {
        'Pending': { color: 'bg-orange-50 text-orange-600', icon: AlertCircle, label: 'Due Soon' },
        'Submitted': { color: 'bg-blue-50 text-blue-600', icon: CheckCircle, label: 'Submitted' },
        'Graded': { color: 'bg-green-50 text-green-600', icon: CheckCircle, label: 'Graded' },
        'Overdue': { color: 'bg-red-50 text-red-600', icon: AlertCircle, label: 'Overdue' }
    };

    const config = statusConfig[assignment.status];
    const StatusIcon = config.icon;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${config.color}`}>
                        <StatusIcon size={12} />
                        {assignment.status}
                    </span>
                    {assignment.grade && (
                        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                            Score: {assignment.grade}
                        </span>
                    )}
                </div>
                <div className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                    {assignment.course}
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#8b5cf6] transition-colors">{assignment.title}</h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{assignment.description}</p>

            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                    <Calendar size={16} />
                    <span>Due: {assignment.dueDate}</span>
                </div>

                {assignment.status === 'Pending' || assignment.status === 'Overdue' ? (
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#8b5cf6] text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 hover:bg-[#7c3aed] transition-all">
                        <Upload size={16} /> Submit
                    </button>
                ) : (
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">
                        <FileText size={16} /> View
                    </button>
                )}
            </div>
        </div>
    );
};

export default AssignmentCard;
