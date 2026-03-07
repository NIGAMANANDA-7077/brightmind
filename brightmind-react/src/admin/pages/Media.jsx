import React, { useState, useEffect } from 'react';
import { useAdminCourses } from '../context/AdminCourseContext';
import { Search, Upload, Filter, FileText, Video, MoreVertical, Trash2, Copy, Link as LinkIcon, X, Check, ChevronsRight, Edit2 } from 'lucide-react';

const EditMediaModal = ({ isOpen, onClose, asset, onSave }) => {
    const [name, setName] = useState('');

    useEffect(() => {
        if (asset) setName(asset.name);
    }, [asset]);

    const handleSubmit = () => {
        if (name.trim()) {
            onSave(asset.id, { name });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Rename Asset</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Asset Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none"
                        autoFocus
                    />
                </div>

                <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-[#8b5cf6] text-white rounded-xl font-bold hover:bg-[#7c3aed] transition-colors shadow-lg shadow-purple-500/20"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

const AssignmentModal = ({ isOpen, onClose, asset, courses, onAssign }) => {
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [selectedModuleId, setSelectedModuleId] = useState('');
    const [selectedLessonId, setSelectedLessonId] = useState('');

    // Cascading Dropdowns Data
    const selectedCourse = courses.find(c => c.id.toString() === selectedCourseId);
    const modules = selectedCourse?.modules || [];
    const selectedModule = modules.find(m => m.id === selectedModuleId);
    const lessons = selectedModule?.lessons || [];

    useEffect(() => {
        if (asset) {
            setSelectedCourseId(asset.courseId?.toString() || '');
            setSelectedModuleId(asset.moduleId || '');
            setSelectedLessonId(asset.lessonId || '');
        }
    }, [asset]);

    const handleSave = () => {
        onAssign(asset.id, {
            courseId: selectedCourseId ? parseInt(selectedCourseId) : null,
            moduleId: selectedModuleId || null,
            lessonId: selectedLessonId || null,
            // Helper text for UI display
            courseName: selectedCourse?.title,
            moduleName: selectedModule?.title,
            lessonName: lessons.find(l => l.id === selectedLessonId)?.title
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Assign Media</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white rounded-lg border border-gray-200">
                            {asset?.type === 'video' ? <Video size={16} /> : <FileText size={16} />}
                        </div>
                        <span className="font-medium text-gray-700 text-sm truncate">{asset?.name}</span>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Course</label>
                        <select
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none"
                            value={selectedCourseId}
                            onChange={(e) => {
                                setSelectedCourseId(e.target.value);
                                setSelectedModuleId('');
                                setSelectedLessonId('');
                            }}
                        >
                            <option value="">Select Course...</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>{course.title}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Module</label>
                        <select
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                            value={selectedModuleId}
                            onChange={(e) => {
                                setSelectedModuleId(e.target.value);
                                setSelectedLessonId('');
                            }}
                            disabled={!selectedCourseId}
                        >
                            <option value="">Select Module...</option>
                            {modules.map(module => (
                                <option key={module.id} value={module.id}>{module.title}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Lesson</label>
                        <select
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                            value={selectedLessonId}
                            onChange={(e) => setSelectedLessonId(e.target.value)}
                            disabled={!selectedModuleId}
                        >
                            <option value="">Select Lesson...</option>
                            {lessons.map(lesson => (
                                <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors">Cancel</button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-[#8b5cf6] text-white rounded-xl font-bold hover:bg-[#7c3aed] transition-colors shadow-lg shadow-purple-500/20"
                    >
                        Save Assignment
                    </button>
                </div>
            </div>
        </div>
    );
};

const Media = () => {
    const { courses, mediaAssets, addMedia, deleteMedia, assignMedia, updateMedia } = useAdminCourses();
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [courseFilter, setCourseFilter] = useState('All');
    const [isDragOver, setIsDragOver] = useState(false);

    // Modal State
    const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);

    // File Upload Logic
    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) addMedia(files);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) addMedia(files);
    };

    // Filter Logic
    const filteredAssets = mediaAssets.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'All' || asset.type === typeFilter;

        // Hide images if type is image (double check to enforce removal)
        if (asset.type === 'image') return false;

        let matchesCourse = true;
        if (courseFilter === 'Unassigned') {
            matchesCourse = !asset.courseId;
        } else if (courseFilter !== 'All') {
            matchesCourse = asset.courseId === parseInt(courseFilter);
        }

        return matchesSearch && matchesType && matchesCourse;
    });

    const getIcon = (type) => {
        switch (type) {
            case 'video': return <Video size={24} className="text-red-500" />;
            case 'document': return <FileText size={24} className="text-blue-500" />;
            default: return <FileText size={24} className="text-gray-500" />;
        }
    };

    const openAssignModal = (asset) => {
        setSelectedAsset(asset);
        setAssignmentModalOpen(true);
    };

    const openEditModal = (asset) => {
        setSelectedAsset(asset);
        setEditModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-fadeIn h-full flex flex-col pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
                    <p className="text-gray-500">Manage videos and documents</p>
                </div>

            </div>

            {/* Upload & Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div
                    className={`bg-white p-8 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center gap-4
                        ${isDragOver ? 'border-[#8b5cf6] bg-[#8b5cf6]/5' : 'border-gray-200'}
                    `}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                >
                    <div className="w-14 h-14 bg-purple-50 text-[#8b5cf6] rounded-full flex items-center justify-center">
                        <Upload size={28} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900">Upload Files</h3>
                        <p className="text-gray-500 text-xs mt-1">MP4, PDF (Max 500MB)</p>
                    </div>
                    <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        id="media-upload"
                    />
                    <button
                        onClick={() => document.getElementById('media-upload').click()}
                        className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-black/10"
                    >
                        Browse Files
                    </button>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
                            <Video size={24} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900">External Video</h3>
                            <p className="text-gray-500 text-xs">Add YouTube or Vimeo links</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <input
                            type="text"
                            id="yt-link-name"
                            placeholder="Video Title (e.g. Physics Lesson 1)"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/20"
                        />
                        <div className="flex gap-2">
                            <input
                                type="text"
                                id="yt-link-url"
                                placeholder="Paste YouTube link here..."
                                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/20"
                            />
                            <button
                                onClick={() => {
                                    const url = document.getElementById('yt-link-url').value;
                                    const name = document.getElementById('yt-link-name').value;
                                    if (url) {
                                        addYoutubeLink(url, name);
                                        document.getElementById('yt-link-url').value = '';
                                        document.getElementById('yt-link-name').value = '';
                                    }
                                }}
                                className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-purple-500/20"
                            >
                                Add link
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gallery Controls */}
            <div className="flex flex-col xl:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search filenames..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {/* Course Filter */}
                    <select
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 max-w-[200px]"
                        value={courseFilter}
                        onChange={(e) => setCourseFilter(e.target.value)}
                    >
                        <option value="All">All Courses</option>
                        <option value="Unassigned">Unassigned Only</option>
                        {courses.map(c => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                    </select>

                    <div className="h-6 w-px bg-gray-300 mx-1 hidden md:block"></div>

                    {['All', 'video', 'document'].map(type => (
                        <button
                            key={type}
                            onClick={() => setTypeFilter(type)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${typeFilter === type
                                ? 'bg-[#8b5cf6] text-white shadow-lg shadow-purple-500/20'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Assets Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredAssets.map((asset) => (
                    <div key={asset.id} className="group relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                        <div className="aspect-video bg-gray-50 flex items-center justify-center relative overflow-hidden">
                            {getIcon(asset.type)}

                            {/* Overlay Actions */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                                <button
                                    className="p-2 bg-white rounded-full text-gray-700 hover:text-purple-600 transition-colors"
                                    title="Assign to Course"
                                    onClick={() => openAssignModal(asset)}
                                >
                                    <LinkIcon size={16} />
                                </button>
                                <button
                                    className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-600 transition-colors"
                                    title="Rename"
                                    onClick={() => openEditModal(asset)}
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    className="p-2 bg-white rounded-full text-gray-700 hover:text-red-500 transition-colors"
                                    title="Delete"
                                    onClick={() => deleteMedia(asset.id)}
                                >
                                    <Trash2 size={16} />
                                </button>
                                <button
                                    className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-500 transition-colors"
                                    title="Copy Link"
                                    onClick={() => navigator.clipboard.writeText(asset.url)}
                                >
                                    <Copy size={16} />
                                </button>
                            </div>

                            {/* Assignment Badge */}
                            {asset.courseId && (
                                <div className="absolute top-2 right-2 bg-green-500/90 text-white text-[10px] px-2 py-0.5 rounded-full font-bold backdrop-blur-sm flex items-center gap-1">
                                    <Check size={10} /> Linked
                                </div>
                            )}
                        </div>
                        <div className="p-3">
                            <p className="text-sm font-medium text-gray-900 truncate" title={asset.name}>{asset.name}</p>
                            <div className="flex justify-between items-center mt-1 mb-2">
                                <span className="text-xs text-gray-400 capitalize">{asset.type}</span>
                                <span className="text-xs text-gray-400">{asset.size}</span>
                            </div>

                            {/* Assignment Details */}
                            {asset.courseName ? (
                                <div className="text-[10px] bg-gray-50 p-2 rounded-lg border border-gray-100 text-gray-500">
                                    <div className="flex items-center gap-1 font-semibold text-gray-700 truncate">
                                        <ChevronsRight size={10} /> {asset.courseName}
                                    </div>
                                    {asset.moduleName && <div className="truncate pl-3">• {asset.moduleName}</div>}
                                    {asset.lessonName && <div className="truncate pl-3">• {asset.lessonName}</div>}
                                </div>
                            ) : (
                                <div className="text-[10px] text-gray-400 italic pl-1">
                                    Unassigned
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {filteredAssets.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-400">
                        <p>No media found matching your filters.</p>
                    </div>
                )}
            </div>

            {/* Assignment Modal */}
            <AssignmentModal
                isOpen={assignmentModalOpen}
                onClose={() => setAssignmentModalOpen(false)}
                asset={selectedAsset}
                courses={courses}
                onAssign={assignMedia}
            />

            {/* Rename Modal */}
            <EditMediaModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                asset={selectedAsset}
                onSave={updateMedia}
            />
        </div>
    );
};

export default Media;
