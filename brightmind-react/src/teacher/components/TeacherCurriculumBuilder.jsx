import React, { useState } from 'react';
import { Plus, GripVertical, Youtube, FileText, Trash2, ChevronDown, CheckCircle2, List } from 'lucide-react';
import { motion, Reorder } from 'framer-motion';
import api from '../../utils/axiosConfig';

const TeacherCurriculumBuilder = ({ modules, updateModules, courseId }) => {
    const [activeModule, setActiveModule] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const addModule = async () => {
        setIsProcessing(true);
        try {
            const res = await api.post('/modules', {
                courseId,
                moduleTitle: 'New Module',
                moduleOrder: modules.length
            });
            const newModule = {
                ...res.data,
                title: res.data.moduleTitle,
                lessons: []
            };
            updateModules([...modules, newModule]);
            setActiveModule(newModule.id);
        } catch (err) {
            console.error("Failed to add module:", err);
        } finally {
            setIsProcessing(false);
        }
    };

    const deleteModule = async (moduleId) => {
        if (!window.confirm("Are you sure you want to delete this module and all its lessons?")) return;
        try {
            await api.delete(`/modules/${moduleId}`);
            updateModules(modules.filter(m => m.id !== moduleId));
        } catch (err) {
            console.error("Failed to delete module:", err);
        }
    };

    const addLesson = async (moduleId) => {
        const targetModule = modules.find(m => m.id === moduleId);
        if (!targetModule) {
            console.error("Target module not found for ID:", moduleId);
            return;
        }

        setIsProcessing(true);
        try {
            const lessonOrder = (targetModule.lessons || []).length;
            console.log(`Adding lesson to module ${moduleId} at order ${lessonOrder}`);
            
            const res = await api.post('/lessons', {
                moduleId,
                lessonTitle: 'New Lesson',
                lessonOrder: lessonOrder
            });

            const updatedModules = modules.map(mod => {
                if (mod.id === moduleId) {
                    return { 
                        ...mod, 
                        lessons: [...(mod.lessons || []), res.data] 
                    };
                }
                return mod;
            });
            updateModules(updatedModules);
            setActiveModule(moduleId);
        } catch (err) {
            console.error("Failed to add lesson:", err);
            alert("Failed to add lesson. Please check server logs.");
        } finally {
            setIsProcessing(false);
        }
    };

    const deleteLesson = async (moduleId, lessonId) => {
        try {
            await api.delete(`/lessons/${lessonId}`);
            const updatedModules = modules.map(mod => {
                if (mod.id === moduleId) {
                    return { ...mod, lessons: mod.lessons.filter(l => l.id !== lessonId) };
                }
                return mod;
            });
            updateModules(updatedModules);
        } catch (err) {
            console.error("Failed to delete lesson:", err);
        }
    };

    const handleModuleTitleChange = async (moduleId, newTitle) => {
        // Update locally for smooth UI
        const updatedModules = modules.map(mod =>
            mod.id === moduleId ? { ...mod, title: newTitle } : mod
        );
        updateModules(updatedModules);

        // Persist to backend
        try {
            await api.put(`/modules/${moduleId}`, { moduleTitle: newTitle });
        } catch (err) {
            console.error("Failed to update module title:", err);
        }
    };

    const handleLessonChange = async (moduleId, lessonId, field, value) => {
        // If pasting an iframe embed code, extract just the src URL
        let processedValue = value;
        if (field === 'videoUrl' && value.includes('<iframe')) {
            const srcMatch = value.match(/src=["']([^"']+)["']/);
            if (srcMatch && srcMatch[1]) {
                processedValue = srcMatch[1];
            }
        }
        // Clean YouTube embed URLs: strip query params like ?si= that cause embed blocks
        if (field === 'videoUrl' && processedValue.includes('youtube.com/embed')) {
            processedValue = processedValue.split('?')[0];
        }

        // Update locally
        const updatedModules = modules.map(mod => {
            if (mod.id === moduleId) {
                return {
                    ...mod,
                    lessons: mod.lessons.map(l => l.id === lessonId ? { ...l, [field]: processedValue } : l)
                };
            }
            return mod;
        });
        updateModules(updatedModules);

        // Persist to backend
        try {
            const updatePayload = {};
            if (field === 'title') updatePayload.lessonTitle = processedValue;
            else updatePayload[field] = processedValue;

            await api.put(`/lessons/${lessonId}`, updatePayload);
        } catch (err) {
            console.error("Failed to update lesson:", err);
        }
    };

    const handleLessonFileUpload = async (moduleId, lessonId, e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const res = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            handleLessonChange(moduleId, lessonId, 'fileUrl', res.data.url);
        } catch (err) {
            console.error("Lesson file upload failed:", err);
        }
    };

    const totalLessons = modules.reduce((acc, mod) => acc + (mod.lessons || []).length, 0);

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-gray-900 font-bold">
                    <div className="flex items-center gap-2">
                        <List size={20} className="text-[#8b5cf6]" />
                        Course Curriculum Builder
                    </div>
                    {totalLessons > 0 && (
                        <span className="bg-[#8b5cf6] text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                            {totalLessons} {totalLessons === 1 ? 'Lesson' : 'Lessons'}
                        </span>
                    )}
                </div>
                <button
                    onClick={addModule}
                    type="button"
                    className="flex items-center gap-2 bg-[#8b5cf6]/10 text-[#8b5cf6] px-4 py-2 rounded-xl hover:bg-[#8b5cf6]/20 transition-all text-xs font-bold"
                >
                    <Plus size={16} /> Add Module
                </button>
            </div>

            <div className="space-y-4">
                {modules.length === 0 && (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 text-sm font-medium">No modules added yet.</p>
                    </div>
                )}

                <Reorder.Group axis="y" values={modules} onReorder={updateModules}>
                    {modules.map((module) => (
                        <Reorder.Item key={module.id} value={module} className="mb-4">
                            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                {/* Module Header */}
                                <div className="bg-gray-50/50 p-4 flex items-center gap-4 border-b border-gray-50">
                                    <GripVertical className="text-gray-300 cursor-grab active:cursor-grabbing" size={18} />
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={module.title}
                                            onChange={(e) => handleModuleTitleChange(module.id, e.target.value)}
                                            className="bg-transparent font-bold text-gray-800 focus:outline-none focus:border-b-2 focus:border-[#8b5cf6] w-full text-sm placeholder:text-gray-300"
                                            placeholder="Enter module title..."
                                        />
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <span className="text-[10px] text-gray-400 font-medium">
                                                {(module.lessons || []).length} {(module.lessons || []).length === 1 ? 'lesson' : 'lessons'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => addLesson(module.id)}
                                            type="button"
                                            className="text-[10px] font-bold text-[#8b5cf6] hover:bg-purple-50 px-2 py-1 rounded-lg transition-colors border border-purple-100"
                                        >
                                            + Add Lesson
                                        </button>
                                        <button
                                            onClick={() => deleteModule(module.id)}
                                            type="button"
                                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
                                            type="button"
                                            className="text-gray-400 p-1 hover:bg-gray-200 rounded-lg transition-colors"
                                        >
                                            <ChevronDown size={18} className={`transform transition-transform ${activeModule === module.id ? 'rotate-180' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* Lessons List */}
                                {activeModule === module.id && (
                                    <div className="p-4 space-y-3 bg-white">
                                        {module.lessons.map((lesson) => (
                                            <div key={lesson.id} className="flex items-center gap-3 p-3 border border-gray-50 rounded-xl hover:border-purple-100 hover:bg-purple-50/20 transition-all group">
                                                <GripVertical className="text-gray-200" size={14} />
                                                <div className={`p-2 rounded-lg ${lesson.type === 'video' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                                    {lesson.type === 'video' ? <Youtube size={16} /> : <FileText size={16} />}
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <input
                                                        type="text"
                                                        value={lesson.title}
                                                        onChange={(e) => handleLessonChange(module.id, lesson.id, 'title', e.target.value)}
                                                        className="w-full bg-transparent text-sm font-bold text-gray-700 focus:outline-none"
                                                        placeholder="Lesson title..."
                                                    />
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-1">
                                                        <div className="flex items-center gap-2">
                                                            <select
                                                                value={lesson.type}
                                                                onChange={(e) => handleLessonChange(module.id, lesson.id, 'type', e.target.value)}
                                                                className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 outline-none cursor-pointer hover:text-[#8b5cf6]"
                                                            >
                                                                <option value="video">Video Lesson</option>
                                                                <option value="pdf">Document / PDF</option>
                                                                <option value="text">Article / Text</option>
                                                            </select>
                                                            <input
                                                                type="text"
                                                                value={lesson.duration}
                                                                onChange={(e) => handleLessonChange(module.id, lesson.id, 'duration', e.target.value)}
                                                                className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 outline-none w-16"
                                                                placeholder="Duration"
                                                                title="Lesson duration"
                                                            />
                                                        </div>

                                                        {lesson.type === 'video' ? (
                                                            <div className="relative">
                                                                <Youtube size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-red-400" />
                                                                <input
                                                                    type="text"
                                                                    value={lesson.videoUrl || ''}
                                                                    onChange={(e) => handleLessonChange(module.id, lesson.id, 'videoUrl', e.target.value)}
                                                                    className="w-full pl-6 pr-2 py-1 bg-gray-50 border border-gray-100 rounded-md text-[10px] outline-none focus:ring-1 focus:ring-red-200"
                                                                    placeholder="YouTube / Video URL"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={lesson.fileUrl || ''}
                                                                    onChange={(e) => handleLessonChange(module.id, lesson.id, 'fileUrl', e.target.value)}
                                                                    className="flex-1 px-2 py-1 bg-gray-50 border border-gray-100 rounded-md text-[10px] outline-none"
                                                                    placeholder="File URL or Link"
                                                                />
                                                                <label className="cursor-pointer p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100">
                                                                    <Upload size={12} />
                                                                    <input type="file" className="hidden" onChange={(e) => handleLessonFileUpload(module.id, lesson.id, e)} />
                                                                </label>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => deleteLesson(module.id, lesson.id)}
                                                    type="button"
                                                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1.5"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        {module.lessons.length === 0 && (
                                            <p className="text-[10px] text-center text-gray-400 py-2">No lessons in this module yet.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            </div>
        </div>
    );
};

export default TeacherCurriculumBuilder;
