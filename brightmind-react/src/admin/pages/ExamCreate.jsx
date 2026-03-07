import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ChevronLeft, Check, FileText, Layers, ListPlus, Printer, Save, Eye, AlertTriangle } from 'lucide-react';
import StepExamInfo from '../components/exams/StepExamInfo';
import StepSections from '../components/exams/StepSections';
import StepQuestionPicker from '../components/exams/StepQuestionPicker';
import StepOMRPreview from '../components/exams/StepOMRPreview';
import ExamPreviewModal from '../components/exams/ExamPreviewModal';
import { useAdminExams } from '../context/AdminExamContext';

const ExamCreate = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { exams, addExam, saveExamDraft, publishExam } = useAdminExams();
    const [currentStep, setCurrentStep] = useState(1);
    const [showPreview, setShowPreview] = useState(false);
    const [lastSavedTime, setLastSavedTime] = useState(null);
    const autoSaveTimerRef = useRef(null);

    const isEditMode = !!id;

    // Default State
    const [examData, setExamData] = useState({
        title: '',
        course: '',
        totalMarks: 0,
        timeLimit: 120, // minutes
        negativeMarking: false,
        status: 'Draft',
        sections: [
            { id: 1, name: 'Physics', marksPerQuestion: 4, questions: [] },
            { id: 2, name: 'Chemistry', marksPerQuestion: 4, questions: [] },
            { id: 3, name: 'Math', marksPerQuestion: 4, questions: [] }
        ]
    });

    // Load Exam Data on Edit
    useEffect(() => {
        if (id) {
            const existingExam = exams.find(e => e.id.toString() === id);
            if (existingExam) {
                setExamData(existingExam);
            } else {
                // Handle not found
            }
        }
    }, [id, exams]);

    // Auto-calculate Total Marks
    useEffect(() => {
        const calculatedTotal = examData.sections.reduce((acc, section) => {
            return acc + (section.questions.length * section.marksPerQuestion);
        }, 0);

        if (calculatedTotal !== examData.totalMarks) {
            setExamData(prev => ({ ...prev, totalMarks: calculatedTotal }));
        }
    }, [examData.sections]);

    // Autosave Logic (Only in Edit Mode or if ID exists after first save)
    useEffect(() => {
        if (!id) return; // Don't autosave generic "new" until first save/create

        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

        autoSaveTimerRef.current = setTimeout(() => {
            if (examData.status === 'Draft' || examData.status === 'Published') {
                saveExamDraft(Number(id), examData);
                setLastSavedTime(new Date());
            }
        }, 15000); // 15 seconds

        return () => clearTimeout(autoSaveTimerRef.current);
    }, [examData, id, saveExamDraft]);

    const steps = [
        { id: 1, title: 'Exam Info', icon: FileText },
        { id: 2, title: 'Sections', icon: Layers },
        { id: 3, title: 'Questions', icon: ListPlus },
        { id: 4, title: 'OMR Preview', icon: Printer },
    ];

    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 4));
    const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    const handleInitialSave = () => {
        if (id) {
            saveExamDraft(Number(id), examData);
            alert('Draft saved manually!');
        } else {
            addExam(examData);
            // In real app, verify ID and redirect to edit mode effectively
            // But mock addExam doesn't return ID easily without refactor.
            // For now, redirect to list or stay.
            alert('Exam Created! Redirecting to list...');
            navigate('/admin/exams');
        }
    };

    const handlePublish = () => {
        if (id) {
            publishExam(Number(id));
            alert('Exam Published Successfully!');
            navigate('/admin/exams');
        } else {
            alert('Please save as draft first.');
        }
    };

    const isLocked = examData.status === 'Locked' || examData.status === 'Scheduled';

    return (
        <div className="max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link to="/admin/exams" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                        <ChevronLeft size={24} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Exam' : 'Create Exam'}</h1>
                            {examData.status && (
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border
                                    ${examData.status === 'Published' ? 'bg-green-50 text-green-700 border-green-200' :
                                        examData.status === 'Draft' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                                            'bg-orange-50 text-orange-700 border-orange-200'}
                                `}>
                                    {examData.status}
                                </span>
                            )}
                        </div>
                        <p className="text-gray-500 flex items-center gap-2">
                            {lastSavedTime ? (
                                <span className="text-xs flex items-center gap-1 text-green-600">
                                    <Check size={12} /> Autosaved {lastSavedTime.toLocaleTimeString()}
                                </span>
                            ) : (
                                "Design offline exams with bubble sheet generation"
                            )}
                        </p>
                    </div>
                </div>

                {/* Top Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowPreview(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                    >
                        <Eye size={18} /> Preview
                    </button>
                    {!isLocked && (
                        <button
                            onClick={handleInitialSave}
                            className="flex items-center gap-2 px-4 py-2 border border-[#8b5cf6] text-[#8b5cf6] rounded-xl font-bold hover:bg-purple-50 transition-colors"
                        >
                            <Save size={18} /> Save Draft
                        </button>
                    )}
                </div>
            </div>

            {/* Locked Banner */}
            {isLocked && (
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6 flex items-center gap-3 text-orange-800">
                    <AlertTriangle size={24} />
                    <div>
                        <p className="font-bold">Restricted Editing Mode</p>
                        <p className="text-sm">This exam is scheduled or locked. Major structural changes are disabled to prevent data inconsistency.</p>
                    </div>
                </div>
            )}

            {/* Stepper */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <div className="flex items-center justify-between relative max-w-3xl mx-auto">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-0"></div>
                    {steps.map((step) => {
                        const isCompleted = currentStep > step.id;
                        const isActive = currentStep === step.id;

                        return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${isActive ? 'border-[#8b5cf6] bg-[#8b5cf6] text-white' :
                                            isCompleted ? 'border-green-500 bg-green-500 text-white' : 'border-gray-200 text-gray-400 bg-white'}
                  `}
                                >
                                    {isCompleted ? <Check size={24} /> : <step.icon size={20} />}
                                </div>
                                <span className={`text-sm font-medium ${isActive ? 'text-[#8b5cf6]' : 'text-gray-500'}`}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Step Content */}
            <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[500px] overflow-hidden ${isLocked ? 'pointer-events-none opacity-80' : ''}`}>
                {currentStep === 1 && <StepExamInfo data={examData} updateData={setExamData} />}
                {currentStep === 2 && <StepSections data={examData} updateData={setExamData} />}
                {currentStep === 3 && <StepQuestionPicker data={examData} updateData={setExamData} />}
                {currentStep === 4 && <StepOMRPreview data={examData} />}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between mt-8 sticky bottom-6 bg-white/80 backdrop-blur-md p-4 rounded-xl border border-gray-200 shadow-lg z-20">
                <button
                    onClick={handlePrev}
                    disabled={currentStep === 1}
                    className={`px-6 py-2.5 rounded-xl font-medium transition-colors ${currentStep === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    Previous
                </button>

                {currentStep < 4 ? (
                    <button
                        onClick={handleNext}
                        className="px-8 py-2.5 bg-[#8b5cf6] text-white rounded-xl font-bold hover:bg-[#7c3aed] transition-all shadow-lg shadow-purple-500/20"
                    >
                        Next Step
                    </button>
                ) : (
                    <button
                        onClick={() => setShowPreview(true)}
                        className="px-8 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-500/20 flex items-center gap-2"
                    >
                        <Eye size={18} /> Preview & Publish
                    </button>
                )}
            </div>

            {/* Preview Modal */}
            <ExamPreviewModal
                isOpen={showPreview}
                exam={examData}
                onClose={() => setShowPreview(false)}
                onPublish={handlePublish}
            />
        </div>
    );
};

export default ExamCreate;
