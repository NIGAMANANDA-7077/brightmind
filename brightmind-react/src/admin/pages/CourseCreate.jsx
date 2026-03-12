import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ChevronLeft, Check, Layout, List, Upload, Save } from 'lucide-react';
import StepBasicInfo from '../components/courses/StepBasicInfo';
import StepPublish from '../components/courses/StepPublish';
import { useAdminCourses } from '../context/AdminCourseContext';
import api from '../../utils/axiosConfig';

const CourseCreate = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get course ID from URL
    const { addCourse, updateCourse, getCourse } = useAdminCourses();
    const isEditMode = !!id;

    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const [courseData, setCourseData] = useState({
        title: '',
        subtitle: '',
        category: '',
        level: 'Beginner',
        price: '',
        description: '',
        thumbnail: '',
        teacherId: '',
        modules: []
    });

    const [teachers, setTeachers] = useState([]);

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const res = await api.get('/users');
                const teacherUsers = res.data.filter(u => u.role === 'Teacher');
                setTeachers(teacherUsers);
            } catch (err) {
                console.error("Failed to fetch teachers", err);
            }
        };
        fetchTeachers();
    }, []);

    // Load existing data if in Edit Mode
    useEffect(() => {
        if (isEditMode) {
            const existingCourse = getCourse(id);
            if (existingCourse) {
                setCourseData(prev => ({ ...prev, ...existingCourse }));
            } else {
                // Handle not found (optional redirect)
                // navigate('/admin/courses');
            }
        }
    }, [id, isEditMode, getCourse]);

    const steps = [
        { id: 1, title: 'Basic Info', icon: Layout },
        { id: 2, title: 'Publish', icon: Upload },
    ];

    // Validation Logic
    const validateStep = (step) => {
        if (step === 1) {
            if (!courseData.title || !courseData.category || !courseData.price) {
                alert('Please fill in required fields: Title, Category, Price');
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 2));
        }
    };

    const handlePrev = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSave = async (status = 'Draft') => {
        setIsLoading(true);
        try {
            const finalData = { ...courseData, status };

            if (isEditMode) {
                await updateCourse(parseInt(id) || id, finalData);
                // alert('Course updated successfully!');
            } else {
                await addCourse(finalData);
                // alert(`Course ${status === 'Published' ? 'Published' : 'Saved as Draft'} successfully!`);
            }
            navigate('/admin/courses');
        } catch (err) {
            console.error("Failed to save course:", err);
            alert("Error saving course. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link to="/admin/courses" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                        <ChevronLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEditMode ? 'Edit Course' : 'Create New Course'}
                        </h1>
                        <p className="text-gray-500">
                            {isEditMode ? 'Update your course content' : 'Follow the steps to build your course'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => handleSave('Draft')}
                        className="px-4 py-2 border border-blue-200 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
                    >
                        <Save size={18} /> Save Draft
                    </button>
                </div>
            </div>

            {/* Stepper */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                <div className="flex items-center justify-between relative">
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
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[500px]">
                {currentStep === 1 && (
                    <StepBasicInfo data={courseData} updateData={setCourseData} teachers={teachers} />
                )}
                {currentStep === 2 && (
                    <StepPublish data={courseData} updateData={setCourseData} />
                )}
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

                {currentStep < 2 ? (
                    <button
                        onClick={handleNext}
                        className="px-8 py-2.5 bg-[#8b5cf6] text-white rounded-xl font-bold hover:bg-[#7c3aed] transition-all shadow-lg shadow-purple-500/20"
                    >
                        Next Step
                    </button>
                ) : (
                    <button
                        onClick={() => handleSave('Published')}
                        disabled={isLoading}
                        className="px-8 py-2.5 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50"
                    >
                        {isLoading ? 'Saving...' : (isEditMode ? 'Update Course' : 'Publish Course')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default CourseCreate;
