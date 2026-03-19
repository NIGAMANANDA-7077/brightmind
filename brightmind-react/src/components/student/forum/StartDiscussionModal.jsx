import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Loader } from 'lucide-react';
import api from '../../../utils/axiosConfig';

const StartDiscussionModal = ({ isOpen, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [courseId, setCourseId] = useState('');
    const [batchId, setBatchId] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState([]);
    const [courses, setCourses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [filteredBatches, setFilteredBatches] = useState([]);
    const [loadingData, setLoadingData] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const loadData = async () => {
            setLoadingData(true);
            try {
                const [cRes, bRes] = await Promise.all([
                    api.get('/teacher/courses'),
                    api.get('/teacher/batches')
                ]);
                setCourses(cRes.data.data || []);
                setBatches(bRes.data.data || []);
            } catch (err) {
                console.error('Failed to load teacher data:', err);
            } finally {
                setLoadingData(false);
            }
        };
        loadData();
    }, [isOpen]);

    // Filter batches by selected course
    useEffect(() => {
        if (courseId) {
            setFilteredBatches(batches.filter(b => b.courseId === courseId));
        } else {
            setFilteredBatches(batches);
        }
        setBatchId('');
    }, [courseId, batches]);

    if (!isOpen) return null;

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
            }
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!courseId || !batchId) return;
        setSubmitting(true);
        try {
            const selectedCourse = courses.find(c => c.id === courseId);
            await onSubmit({
                title,
                description,
                courseId,
                batchId,
                courseName: selectedCourse?.title || '',
                tags
            });
            setTitle('');
            setDescription('');
            setCourseId('');
            setBatchId('');
            setTags([]);
            setTagInput('');
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xl z-10">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <div className="p-2 bg-[#8b5cf6]/10 rounded-xl text-[#8b5cf6]">
                            <MessageSquare size={20} />
                        </div>
                        Start a Discussion
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {loadingData ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader size={28} className="animate-spin text-[#8b5cf6]" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Course Selection */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Select Course</label>
                            <select
                                value={courseId}
                                onChange={(e) => setCourseId(e.target.value)}
                                required
                                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] font-medium text-gray-600"
                            >
                                <option value="" disabled>Choose a course</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>{course.title}</option>
                                ))}
                            </select>
                            {courses.length === 0 && (
                                <p className="text-xs text-gray-400 mt-1">No courses assigned to you yet.</p>
                            )}
                        </div>

                        {/* Batch Selection */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Select Batch</label>
                            <select
                                value={batchId}
                                onChange={(e) => setBatchId(e.target.value)}
                                required
                                disabled={!courseId}
                                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] font-medium text-gray-600 disabled:bg-gray-50 disabled:text-gray-400"
                            >
                                <option value="" disabled>
                                    {courseId ? 'Choose a batch' : 'Select a course first'}
                                </option>
                                {filteredBatches.map(batch => (
                                    <option key={batch.id} value={batch.id}>{batch.batchName}</option>
                                ))}
                            </select>
                            {courseId && filteredBatches.length === 0 && (
                                <p className="text-xs text-amber-500 mt-1">No batches found for this course.</p>
                            )}
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Important notes on React Hooks"
                                required
                                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] font-bold text-gray-900 placeholder:font-normal"
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Tags <span className="font-normal text-gray-400">(Press Enter to add)</span>
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {tags.map(tag => (
                                    <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
                                        #{tag}
                                        <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                placeholder="Add tags e.g. react, hooks, state..."
                                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6]"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the topic in detail..."
                                required
                                rows={6}
                                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] resize-none"
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || !courseId || !batchId}
                                className="px-6 py-3 rounded-xl bg-[#8b5cf6] text-white font-bold hover:bg-[#7c3aed] shadow-lg shadow-purple-500/20 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {submitting ? 'Posting...' : 'Start Discussion'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default StartDiscussionModal;
