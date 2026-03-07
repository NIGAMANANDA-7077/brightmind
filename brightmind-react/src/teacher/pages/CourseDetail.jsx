import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, BookOpen, Upload, File, Video, Trash2, Plus,
    CheckCircle, ChevronDown, ChevronUp, Clock, Loader2, FileText
} from 'lucide-react';

// =========================================================
// Teacher Course Detail — Syllabus + Upload inside course
// =========================================================

const CourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [expandedModule, setExpandedModule] = useState(null);

    const fetchCourse = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/courses/${courseId}`);
            setCourse(res.data);
            if (res.data.modules && res.data.modules.length > 0) {
                setExpandedModule(res.data.modules[0].id || 0);
            }
        } catch (err) {
            console.error("Failed to fetch course detail:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress(10);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/upload`, formData, {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            // Update course materials in DB
            const updatedMaterials = [...(course.materials || []), uploadRes.data.url];
            await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/courses/${courseId}`, {
                materials: updatedMaterials
            });

            setCourse({ ...course, materials: updatedMaterials });
            alert('File uploaded and linked to course successfully!');
        } catch (err) {
            console.error("Upload failed:", err);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const removeMaterial = async (url) => {
        try {
            const updatedMaterials = course.materials.filter(m => m !== url);
            await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/courses/${courseId}`, {
                materials: updatedMaterials
            });
            setCourse({ ...course, materials: updatedMaterials });
        } catch (err) {
            console.error("Failed to remove material:", err);
        }
    };

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#8b5cf6]" size={40} />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="text-center py-20 text-gray-400">
                <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">Course not found</p>
                <button onClick={() => navigate('/teacher/courses')} className="text-[#8b5cf6] font-bold mt-2 hover:underline">
                    ← Back to Courses
                </button>
            </div>
        );
    }

    const syllabus = course.modules || [];
    const materials = course.materials || [];

    return (
        <div className="space-y-6 animate-fadeIn pb-20">
            {/* Back */}
            <button
                onClick={() => navigate('/teacher/courses')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
            >
                <ArrowLeft size={18} /> Back to Courses
            </button>

            {/* Header */}
            <div className="bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white p-8 rounded-[2rem] shadow-xl shadow-purple-500/10">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/20">
                                {course.subject}
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/20 ${course.status === 'Active' || course.status === 'Published' ? 'bg-green-400/20 text-green-100' : 'bg-yellow-400/20 text-yellow-100'}`}>
                                {course.status}
                            </span>
                        </div>
                        <h1 className="text-3xl font-black mb-2">{course.title}</h1>
                        <p className="text-white/70 max-w-2xl leading-relaxed">{course.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:w-64">
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                            <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-1">Students</p>
                            <p className="text-xl font-black">{course.studentsEnrolled || 0}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                            <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-1">Materials</p>
                            <p className="text-xl font-black">{materials.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Syllabus Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                            <BookOpen size={24} className="text-[#8b5cf6]" /> Course Syllabus
                        </h2>
                        <span className="text-xs font-bold text-gray-400">{syllabus.length} Modules Total</span>
                    </div>

                    {syllabus.length === 0 ? (
                        <div className="bg-gray-50 rounded-3xl p-12 text-center border border-dashed border-gray-200">
                            <BookOpen size={32} className="mx-auto text-gray-300 mb-2 opacity-50" />
                            <p className="text-gray-500 font-bold">No modules defined yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {syllabus.map((mod, idx) => (
                                <div key={idx} className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:border-[#8b5cf6]/30 transition-all">
                                    <button
                                        className="w-full flex items-center justify-between p-6 text-left"
                                        onClick={() => setExpandedModule(expandedModule === idx ? null : idx)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-50 text-gray-400 group-hover:bg-purple-50 group-hover:text-[#8b5cf6] rounded-xl flex items-center justify-center font-black text-sm transition-colors">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{mod.title || `Module ${idx + 1}`}</h3>
                                                <p className="text-xs text-gray-400 mt-0.5">{(mod.topics || []).length} Core Topics</p>
                                            </div>
                                        </div>
                                        {expandedModule === idx ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                                    </button>

                                    {expandedModule === idx && (
                                        <div className="px-6 pb-6 pt-0 animate-fadeIn">
                                            <div className="h-px bg-gray-50 mb-6" />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {(mod.topics || []).map((topic, i) => (
                                                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl border border-gray-100/50">
                                                        <div className="w-6 h-6 bg-white border border-gray-100 rounded-lg flex items-center justify-center text-[10px] font-black text-[#8b5cf6]">
                                                            {i + 1}
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-700">{topic}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar: Uploads & Exams */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                            <Upload size={18} className="text-[#8b5cf6]" /> Resource Center
                        </h3>

                        {/* Real Upload Area */}
                        <div className="relative group">
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={handleFileUpload}
                                disabled={uploading}
                            />
                            <div className={`p-8 border-2 border-dashed rounded-2xl text-center transition-all ${uploading ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200 group-hover:border-[#8b5cf6] group-hover:bg-purple-50/30'}`}>
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-3 text-[#8b5cf6]">
                                    {uploading ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />}
                                </div>
                                <p className="text-sm font-bold text-gray-700 mb-1">Add Learning Material</p>
                                <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider">PDF, MP4, PPT, DOC</p>
                            </div>
                        </div>

                        {uploading && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black text-[#8b5cf6] uppercase tracking-widest">
                                    <span>Uploading material...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-[#8b5cf6] h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                </div>
                            </div>
                        )}

                        {/* List of uploaded materials */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Live Assets ({materials.length})</p>
                            {materials.map((m, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl group/item">
                                    <div className={`p-2 rounded-xl bg-white shadow-sm ${m.includes('.mp4') || m.includes('video') ? 'text-blue-500' : 'text-orange-500'}`}>
                                        {m.includes('.mp4') || m.includes('video') ? <Video size={16} /> : <FileText size={16} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-900 truncate">{m.split('/').pop()}</p>
                                        <p className="text-[10px] text-gray-400 font-medium">Click to view asset</p>
                                    </div>
                                    <button
                                        onClick={() => removeMaterial(m)}
                                        className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Link to Exams Page */}
                    <Link
                        to="/teacher/exams"
                        className="block bg-orange-500 hover:bg-orange-600 text-white p-6 rounded-[2rem] shadow-lg shadow-orange-500/20 transition-all group"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <FileText size={24} className="group-hover:scale-110 transition-transform" />
                            <ArrowLeft size={20} className="rotate-180 opacity-50" />
                        </div>
                        <h4 className="font-black text-lg">Exam Question Papers</h4>
                        <p className="text-white/80 text-xs font-medium mt-1">Submit new questions for admin review and final approval.</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
