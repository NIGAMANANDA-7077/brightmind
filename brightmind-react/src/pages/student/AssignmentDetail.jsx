import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, AlertCircle } from 'lucide-react';
import { useAssignment } from '../../context/AssignmentContext';
import FileUploadAssignment from '../../components/student/assignments/FileUploadAssignment';
import WrittenAssignment from '../../components/student/assignments/WrittenAssignment';
import OMRExam from '../../components/student/assignments/omr/OMRExam';

const AssignmentDetail = () => {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const { getAssignment, submitFileAssignment, submitWrittenAssignment, submitOMR } = useAssignment();

    const assignment = getAssignment(assignmentId);

    if (!assignment) {
        return <div className="p-8 text-center text-gray-500">Assignment not found</div>;
    }

    const renderAssignmentContent = () => {
        const type = (assignment.type || 'File').toLowerCase();
        switch (type) {
            case 'file':
                return (
                    <FileUploadAssignment
                        assignment={assignment}
                        onSubmit={(fileName) => submitFileAssignment(assignment.id, fileName)}
                    />
                );
            case 'written':
                return (
                    <WrittenAssignment
                        assignment={assignment}
                        onSubmit={(content) => submitWrittenAssignment(assignment.id, content)}
                    />
                );
            case 'omr':
                return (
                    <OMRExam
                        assignment={assignment}
                        onSubmit={(answers, score) => submitOMR(assignment.id, answers, score)}
                    />
                );
            default:
                return (
                    <FileUploadAssignment
                        assignment={assignment}
                        onSubmit={(fileName) => submitFileAssignment(assignment.id, fileName)}
                    />
                );
        }
    };

    // For OMR, we might want a different layout (fullscreen-ish) without the standard header
    if ((assignment.type || '').toLowerCase() === 'omr' && assignment.status !== 'Graded') {
        return (
            <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium mb-4"
                >
                    <ArrowLeft size={20} /> Back to Assignments
                </button>
                {renderAssignmentContent()}
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto animate-fade-in space-y-8">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
            >
                <ArrowLeft size={20} /> Back to Assignments
            </button>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                    <div>
                        <span className="px-3 py-1 rounded-lg bg-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 inline-block">
                            {assignment.courseName}
                        </span>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
                        <p className="text-gray-500 max-w-2xl">{assignment.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className={`px-4 py-2 rounded-xl font-bold text-sm ${assignment.status === 'Submitted' || assignment.status === 'Graded'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            {assignment.status}
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 font-medium text-sm">
                                <Calendar size={16} /> Due: {assignment.deadline || assignment.dueDate}
                            </div>
                    </div>
                </div>

                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-3 text-sm text-blue-800">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <p>Make sure to review your work before submitting. Once submitted, you cannot make changes.</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                {renderAssignmentContent()}
            </div>
        </div>
    );
};

export default AssignmentDetail;
