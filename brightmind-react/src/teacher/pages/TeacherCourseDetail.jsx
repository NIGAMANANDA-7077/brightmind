import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/axiosConfig';
import {
    BookOpen, ArrowLeft, Save, FileText,
    Layout, Loader2, CheckCircle, AlertCircle, Upload, Clock, BarChart, List
} from 'lucide-react';
import TeacherCurriculumBuilder from '../components/TeacherCurriculumBuilder';

const TeacherCourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    const [formData, setFormData] = useState({
        detailedDescription: '',
        syllabusText: '',
        syllabusUrl: '',
        duration: '',
        level: 'Beginner',
        learningOutcomes: '',
        modules: []
    });

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await api.get(`/courses/${courseId}`);
                setCourse(res.data);
                const fetchedModules = (res.data.courseModules || res.data.modules || []).map(m => ({
                    ...m,
                    title: m.moduleTitle || m.title, // Standardize title
                    lessons: (m.lessons || []).map(l => ({
                        ...l,
                        title: l.lessonTitle || l.title // Standardize lesson title
                    }))
                }));
                setFormData({
                    detailedDescription: res.data.detailedDescription || '',
                    syllabusText: res.data.syllabusText || '',
                    syllabusUrl: res.data.syllabusUrl || '',
                    duration: res.data.duration || '',
                    level: res.data.level || 'Beginner',
                    learningOutcomes: res.data.learningOutcomes || '',
                    modules: fetchedModules
                });
            } catch (err) {
                console.error("Failed to fetch course:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            setMessage({ type: 'info', text: 'Uploading file...' });
            const res = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData({ ...formData, syllabusUrl: res.data.url });
            setMessage({ type: 'success', text: 'File uploaded successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'File upload failed.' });
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await api.put(`/courses/${courseId}`, formData);
            setMessage({ type: 'success', text: 'Course details updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update course details.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#8b5cf6]" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 max-w-5xl mx-auto p-4">
            <button
                onClick={() => navigate('/teacher/courses')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
            >
                <ArrowLeft size={20} /> Back to My Courses
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#8b5cf6]/10 rounded-2xl">
                        <BookOpen size={28} className="text-[#8b5cf6]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{course?.title}</h1>
                        <p className="text-gray-500 text-sm">{course?.subject} · Manage Syllabus & Details</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-[#8b5cf6] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#7c3aed] transition-all disabled:opacity-50"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' :
                    message.type === 'info' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : message.type === 'info' ? <Loader2 size={20} className="animate-spin" /> : <AlertCircle size={20} />}
                    <p className="text-sm font-medium">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Detailed Description */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <div className="flex items-center gap-2 text-gray-900 font-bold">
                            <Layout size={20} className="text-[#8b5cf6]" />
                            Detailed Course Description
                        </div>
                        <textarea
                            className="w-full min-h-[200px] p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none transition-all text-sm leading-relaxed"
                            placeholder="Provide an in-depth description..."
                            value={formData.detailedDescription}
                            onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
                        />
                    </div>

                    {/* Learning Outcomes */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <div className="flex items-center gap-2 text-gray-900 font-bold">
                            <BarChart size={20} className="text-[#8b5cf6]" />
                            Learning Outcomes (What students will achieve)
                        </div>
                        <textarea
                            className="w-full min-h-[150px] p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none transition-all text-sm leading-relaxed"
                            placeholder="Example:&#10;- Master React Hooks&#10;- Deploy to Cloud..."
                            value={formData.learningOutcomes}
                            onChange={(e) => setFormData({ ...formData, learningOutcomes: e.target.value })}
                        />
                    </div>

                    {/* Structured Curriculum Builder */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <TeacherCurriculumBuilder
                            courseId={courseId}
                            modules={formData.modules}
                            updateModules={(newModules) => setFormData({ ...formData, modules: newModules })}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Course Metadata */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Course Info</h3>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2">Duration (e.g. 12 Hours)</label>
                            <div className="relative">
                                <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium"
                                    placeholder="e.g. 15 Hours"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2">Skill Level</label>
                            <div className="relative">
                                <BarChart size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium appearance-none"
                                    value={formData.level}
                                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Syllabus Upload */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Syllabus File</h3>

                        {formData.syllabusUrl ? (
                            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 space-y-3">
                                <div className="flex items-center gap-2 text-[#8b5cf6] font-bold text-xs truncate">
                                    <FileText size={14} />
                                    {formData.syllabusUrl.split('/').pop()}
                                </div>
                                <div className="flex gap-4">
                                    <a href={formData.syllabusUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#8b5cf6] font-bold hover:underline">View File</a>
                                    <button
                                        onClick={() => setFormData({ ...formData, syllabusUrl: '' })}
                                        className="text-[10px] text-red-500 font-bold hover:underline"
                                    >
                                        Remove File
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-[#8b5cf6]/50 hover:bg-gray-50 transition-all group">
                                <Upload size={24} className="text-gray-400 group-hover:text-[#8b5cf6] mb-2" />
                                <span className="text-xs font-bold text-gray-500 group-hover:text-[#8b5cf6]">Upload Syllabus PDF</span>
                                <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
                            </label>
                        )}

                        <div className="pt-2">
                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Or External Link</label>
                            <input
                                type="text"
                                className="w-full p-2 border-b border-gray-200 text-xs outline-none focus:border-[#8b5cf6] transition-colors"
                                placeholder="Paste link here..."
                                value={formData.syllabusUrl}
                                onChange={(e) => setFormData({ ...formData, syllabusUrl: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherCourseDetail;
