import React, { useState } from 'react';
import { Plus, GripVertical, Youtube, FileText, Trash2, ChevronDown, CheckCircle2 } from 'lucide-react';
import { motion, Reorder } from 'framer-motion';

const StepCurriculum = ({ data, updateData }) => {
    const [activeModule, setActiveModule] = useState(null);

    const addModule = () => {
        const newModule = {
            id: `mod_${Date.now()}`,
            title: 'New Module',
            lessons: []
        };
        updateData({ ...data, modules: [...data.modules, newModule] });
        setActiveModule(newModule.id);
    };

    const addLesson = (moduleId, type = 'video') => {
        const newLesson = {
            id: `les_${Date.now()}`,
            title: 'New Lesson',
            type,
            duration: '00:00',
            isUploading: false
        };

        const updatedModules = data.modules.map(mod => {
            if (mod.id === moduleId) {
                return { ...mod, lessons: [...mod.lessons, newLesson] };
            }
            return mod;
        });
        updateData({ ...data, modules: updatedModules });
    };

    const handleModuleTitleChange = (moduleId, newTitle) => {
        const updatedModules = data.modules.map(mod =>
            mod.id === moduleId ? { ...mod, title: newTitle } : mod
        );
        updateData({ ...data, modules: updatedModules });
    };

    const simulateUpload = (moduleId, lessonId) => {
        const updatedModules = data.modules.map(mod => {
            if (mod.id === moduleId) {
                const updatedLessons = mod.lessons.map(les =>
                    les.id === lessonId ? { ...les, isUploading: true } : les
                );
                return { ...mod, lessons: updatedLessons };
            }
            return mod;
        });
        updateData({ ...data, modules: updatedModules });

        setTimeout(() => {
            const finalModules = data.modules.map(mod => {
                if (mod.id === moduleId) {
                    const finishedLessons = mod.lessons.map(les =>
                        les.id === lessonId ? { ...les, isUploading: false, duration: '12:45' } : les
                    );
                    return { ...mod, lessons: finishedLessons };
                }
                return mod;
            });
            updateData({ ...data, modules: finalModules });
        }, 2000);
    };

    return (
        <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Course Curriculum</h2>
                <button
                    onClick={addModule}
                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                    <Plus size={16} /> Add Module
                </button>
            </div>

            <div className="space-y-4">
                {data.modules.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 font-medium">No modules added yet. Click "Add Module" to start.</p>
                    </div>
                )}

                <Reorder.Group axis="y" values={data.modules} onReorder={(newModules) => updateData({ ...data, modules: newModules })}>
                    {data.modules.map((module) => (
                        <Reorder.Item key={module.id} value={module} className="mb-4">
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                {/* Module Header */}
                                <div className="bg-gray-50 p-4 flex items-center gap-4">
                                    <GripVertical className="text-gray-400 cursor-grab active:cursor-grabbing" size={20} />
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={module.title}
                                            onChange={(e) => handleModuleTitleChange(module.id, e.target.value)}
                                            className="bg-transparent font-bold text-gray-800 focus:outline-none focus:border-b-2 focus:border-[#8b5cf6] w-full"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => addLesson(module.id)} className="text-xs font-semibold text-[#8b5cf6] hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors">
                                            + Add Lesson
                                        </button>
                                        <button
                                            onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
                                            className="text-gray-500 p-1 hover:bg-gray-200 rounded"
                                        >
                                            <ChevronDown size={20} className={`transform transition-transform ${activeModule === module.id ? 'rotate-180' : ''}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* Lessons List */}
                                {activeModule === module.id && (
                                    <div className="p-4 space-y-3 bg-white">
                                        {module.lessons.map((lesson) => (
                                            <div key={lesson.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group">
                                                <GripVertical className="text-gray-300" size={16} />
                                                <div className={`p-2 rounded-lg ${lesson.type === 'video' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                                    {lesson.type === 'video' ? <Youtube size={18} /> : <FileText size={18} />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{lesson.title}</p>
                                                    <p className="text-xs text-gray-400">{lesson.type === 'video' ? 'Video Lesson' : 'PDF Document'}</p>
                                                </div>

                                                {/* Upload Simulation */}
                                                {lesson.isUploading ? (
                                                    <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div className="h-full bg-green-500 w-2/3 animate-pulse"></div>
                                                    </div>
                                                ) : lesson.duration !== '00:00' ? (
                                                    <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                                                        <CheckCircle2 size={14} /> Uploaded
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => simulateUpload(module.id, lesson.id)}
                                                        className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                                                    >
                                                        Upload Content
                                                    </button>
                                                )}

                                                <button className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        {module.lessons.length === 0 && (
                                            <p className="text-sm text-center text-gray-400 py-2">No lessons in this module yet.</p>
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

export default StepCurriculum;
