import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Play, CheckCircle, ChevronLeft, ChevronRight,
    Menu, Download, FileText, MessageSquare, Loader2, Trash2, ExternalLink, Save
} from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import api from '../../utils/axiosConfig';

const CoursePlayer = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { getCourse, markLessonComplete } = useCourse();

    // State
    const [activeLesson, setActiveLesson] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Notes state
    const [noteContent, setNoteContent] = useState('');
    const [noteSaving, setNoteSaving] = useState(false);
    const [noteLoading, setNoteLoading] = useState(false);
    const [noteSaved, setNoteSaved] = useState(false);

    const course = getCourse(courseId);

    // Initial load: find first incomplete lesson or first lesson
    useEffect(() => {
        if (course && !activeLesson) {
            let firstIncomplete = null;
            let firstLesson = null;

            for (const module of course.modules) {
                for (const lesson of module.lessons) {
                    if (!firstLesson) firstLesson = { ...lesson, moduleId: module.id };
                    if (!lesson.isCompleted && !firstIncomplete) {
                        firstIncomplete = { ...lesson, moduleId: module.id };
                        break;
                    }
                }
                if (firstIncomplete) break;
            }

            setActiveLesson(firstIncomplete || firstLesson);
        }
    }, [course, activeLesson]);

    // Fetch saved note when active lesson changes
    useEffect(() => {
        if (!activeLesson?.id) return;
        setNoteContent('');
        setNoteSaved(false);
        const fetchNote = async () => {
            setNoteLoading(true);
            try {
                const res = await api.get(`/notes/${activeLesson.id}`);
                setNoteContent(res.data.content || '');
            } catch (err) {
                // No note found is fine
                setNoteContent('');
            } finally {
                setNoteLoading(false);
            }
        };
        fetchNote();
    }, [activeLesson?.id]);

    if (!course) return null;

    const handleLessonChange = (lesson, moduleId) => {
        setActiveLesson({ ...lesson, moduleId });
    };

    const handleMarkComplete = () => {
        if (activeLesson) {
            const currentModuleId = activeLesson.moduleId; // moduleId is attached in local state
            // Find actual module id if lost.
            // But we are storing it in activeLesson state above.
            markLessonComplete(course.id, activeLesson.moduleId, activeLesson.id);

            // Auto advance to next lesson logic could go here
            // toast.success("Lesson Completed!"); 
        }
    };

    const isCurrentLessonCompleted = () => {
        if (!activeLesson) return false;
        const module = course.modules.find(m => m.id === activeLesson.moduleId);
        const lesson = module?.lessons.find(l => l.id === activeLesson.id);
        return lesson?.isCompleted;
    };

    // Flatten lessons for next/prev navigation
    const allLessons = course.modules.flatMap(m => m.lessons.map(l => ({ ...l, moduleId: m.id })));
    const currentIndex = activeLesson ? allLessons.findIndex(l => l.id === activeLesson.id) : -1;
    const hasNext = currentIndex < allLessons.length - 1;
    const hasPrev = currentIndex > 0;

    const goToNext = () => {
        if (hasNext) setActiveLesson(allLessons[currentIndex + 1]);
    };

    const goToPrev = () => {
        if (hasPrev) setActiveLesson(allLessons[currentIndex - 1]);
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900 z-20">
                    <button
                        onClick={() => navigate(`/student/course/${courseId}`)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                    >
                        <ChevronLeft size={18} /> Back to Course
                    </button>
                    <h1 className="text-sm font-bold truncate max-w-md hidden md:block">{course.title}</h1>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors md:hidden"
                    >
                        <Menu size={20} />
                    </button>
                </div>

                {/* Video Player & Tabs */}
                <div className="flex-1 overflow-y-auto">
                    {/* Player Container */}
                    <div className="aspect-video bg-black relative">
                        {activeLesson ? (
                            <div className="absolute inset-0">
                                {activeLesson.type === 'video' && activeLesson.videoUrl ? (
                                    <iframe
                                        src={(() => {
                                            let url = activeLesson.videoUrl;
                                            // Convert watch URLs to embed format
                                            if (url.includes('watch?v=')) {
                                                url = url.replace('watch?v=', 'embed/');
                                            }
                                            // Convert youtu.be short links to embed format
                                            if (url.includes('youtu.be/')) {
                                                url = url.replace('youtu.be/', 'youtube.com/embed/');
                                            }
                                            // Strip ALL query params from embed URLs to prevent refusal
                                            if (url.includes('youtube.com/embed')) {
                                                url = url.split('?')[0].split('&')[0];
                                            }
                                            return url;
                                        })()}
                                        title={activeLesson.title}
                                        className="w-full h-full border-0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                                        <div className="text-center">
                                            <div className="p-4 bg-gray-800 rounded-2xl mb-4">
                                                <FileText size={48} className="text-[#8b5cf6] mx-auto" />
                                            </div>
                                            <p className="font-bold text-lg mb-2">{activeLesson.title}</p>
                                            <p className="text-gray-500 text-sm">Document / Text Lesson</p>
                                            <button className="mt-4 px-6 py-2 bg-[#8b5cf6] rounded-xl text-sm font-bold">
                                                View Resources
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                Select a lesson to start
                            </div>
                        )}
                    </div>

                    {/* Content below player */}
                    <div className="p-8 max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-2xl font-bold mb-2">{activeLesson?.title}</h1>
                                <p className="text-gray-400 text-sm">Lesson {currentIndex + 1} of {course.totalLessons}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {hasPrev && (
                                    <button
                                        onClick={goToPrev}
                                        className="p-3 rounded-xl border border-gray-700 hover:bg-gray-800 transition-colors"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                )}
                                {hasNext && (
                                    <button
                                        onClick={goToNext}
                                        className="p-3 rounded-xl border border-gray-700 hover:bg-gray-800 transition-colors"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="flex flex-wrap items-center gap-4 mb-10 pb-10 border-b border-gray-800">
                            <button
                                onClick={handleMarkComplete}
                                disabled={isCurrentLessonCompleted()}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${isCurrentLessonCompleted()
                                        ? 'bg-green-500/20 text-green-500 cursor-default'
                                        : 'bg-[#8b5cf6] hover:bg-[#7c3aed] text-white hover:scale-105 active:scale-95'
                                    }`}
                            >
                                {isCurrentLessonCompleted() ? 'Completed' : 'Mark as Complete'}
                                <CheckCircle size={18} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="space-y-6">
                            <div className="flex border-b border-gray-800">
                                {['overview', 'resources', 'notes'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-6 py-3 text-sm font-bold capitalize transition-colors relative ${activeTab === tab
                                                ? 'text-white'
                                                : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                    >
                                        {tab}
                                        {activeTab === tab && (
                                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#8b5cf6]"></div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="min-h-[200px]">
                                {activeTab === 'overview' && (
                                    <div className="space-y-4 text-gray-400 leading-relaxed whitespace-pre-wrap">
                                        {activeLesson?.description ? (
                                            activeLesson.description
                                        ) : (
                                            <p className="italic text-gray-500">No description provided for this lesson.</p>
                                        )}
                                    </div>
                                )}
                                {activeTab === 'resources' && (
                                    <div className="space-y-3">
                                        {activeLesson?.fileUrl ? (
                                            <a
                                                href={activeLesson.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-4 bg-gray-800 rounded-xl border border-gray-700 hover:border-[#8b5cf6] transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-200 group-hover:text-white transition-colors">
                                                            Lesson Resource
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate max-w-xs">
                                                            {activeLesson.fileUrl.split('/').pop()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <ExternalLink size={18} className="text-gray-500 group-hover:text-[#8b5cf6] transition-colors" />
                                            </a>
                                        ) : (
                                            <div className="text-center py-10 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
                                                <FileText size={36} className="mx-auto mb-3 text-gray-600" />
                                                <p className="text-gray-500 font-medium text-sm">No resources available for this lesson.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {activeTab === 'notes' && (
                                    <div className="space-y-4">
                                        {noteLoading ? (
                                            <div className="flex items-center justify-center py-10">
                                                <Loader2 className="animate-spin text-[#8b5cf6]" size={28} />
                                            </div>
                                        ) : (
                                            <>
                                                <textarea
                                                    value={noteContent}
                                                    onChange={(e) => { setNoteContent(e.target.value); setNoteSaved(false); }}
                                                    placeholder="Type your notes for this lesson here..."
                                                    className="w-full h-48 bg-gray-800 border border-gray-700 rounded-xl p-4 text-gray-300 focus:outline-none focus:border-[#8b5cf6] placeholder-gray-600 resize-none transition-colors text-sm leading-relaxed"
                                                ></textarea>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={async () => {
                                                            if (!activeLesson) return;
                                                            setNoteSaving(true);
                                                            try {
                                                                await api.post(`/notes/${activeLesson.id}`, { content: noteContent });
                                                                setNoteSaved(true);
                                                                setTimeout(() => setNoteSaved(false), 3000);
                                                            } catch (err) {
                                                                console.error('Failed to save note:', err);
                                                            } finally {
                                                                setNoteSaving(false);
                                                            }
                                                        }}
                                                        disabled={noteSaving}
                                                        className="flex items-center gap-2 px-5 py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
                                                    >
                                                        {noteSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                                        {noteSaving ? 'Saving...' : 'Save Note'}
                                                    </button>
                                                    {noteContent && (
                                                        <button
                                                            onClick={async () => {
                                                                if (!activeLesson) return;
                                                                try {
                                                                    await api.delete(`/notes/${activeLesson.id}`);
                                                                    setNoteContent('');
                                                                } catch (err) {
                                                                    console.error('Failed to delete note:', err);
                                                                }
                                                            }}
                                                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 text-sm font-bold rounded-xl transition-colors border border-gray-700"
                                                        >
                                                            <Trash2 size={16} />
                                                            Clear
                                                        </button>
                                                    )}
                                                    {noteSaved && (
                                                        <span className="flex items-center gap-1 text-green-400 text-xs font-bold animate-pulse">
                                                            <CheckCircle size={14} /> Saved!
                                                        </span>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Lesson List */}
            <div className={`w-80 bg-gray-900 border-l border-gray-800 flex flex-col transition-all duration-300 absolute md:relative right-0 h-full z-30 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0 md:w-0 border-none'
                }`}>
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                    <h2 className="font-bold text-lg">Course Content</h2>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400">
                        <ChevronRight size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {course.modules.map((module, mIndex) => (
                        <div key={module.id}>
                            <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-800/50 text-xs font-bold text-gray-400 uppercase tracking-wider sticky top-0 backdrop-blur-sm">
                                Module {mIndex + 1}: {module.title}
                            </div>
                            <div className="divide-y divide-gray-800">
                                {module.lessons.map(lesson => (
                                    <button
                                        key={lesson.id}
                                        onClick={() => handleLessonChange(lesson, module.id)}
                                        className={`w-full px-6 py-4 flex items-start gap-3 text-left hover:bg-gray-800 transition-colors ${activeLesson?.id === lesson.id ? 'bg-gray-800/80 border-l-4 border-[#8b5cf6]' : 'border-l-4 border-transparent'
                                            }`}
                                    >
                                        <div className="mt-0.5">
                                            {lesson.isCompleted ? (
                                                <CheckCircle size={16} className="text-green-500" />
                                            ) : (
                                                <div className={`w-4 h-4 rounded-full border-2 ${activeLesson?.id === lesson.id ? 'border-[#8b5cf6]' : 'border-gray-600'
                                                    }`}></div>
                                            )}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-medium mb-1 ${activeLesson?.id === lesson.id ? 'text-white' : 'text-gray-400'
                                                }`}>
                                                {lesson.title}
                                            </p>
                                            <p className="text-xs text-gray-600">{lesson.duration}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CoursePlayer;
