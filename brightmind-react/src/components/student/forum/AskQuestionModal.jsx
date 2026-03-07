import React, { useState } from 'react';
import { X, MessageSquare } from 'lucide-react';

const AskQuestionModal = ({ isOpen, onClose, onSubmit, courses, initialCourseId }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [courseId, setCourseId] = useState(initialCourseId || '');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState([]);

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

    const handleSubmit = (e) => {
        e.preventDefault();
        const selectedCourse = courses.find(c => c.id === courseId);

        onSubmit({
            title,
            description,
            courseId,
            courseName: selectedCourse ? selectedCourse.title : 'General',
            tags
        });

        // Reset and close
        setTitle('');
        setDescription('');
        setTags([]);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xl z-10">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <div className="p-2 bg-[#8b5cf6]/10 rounded-xl text-[#8b5cf6]">
                            <MessageSquare size={20} />
                        </div>
                        Ask a Question
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

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
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., How to implement dark mode in React?"
                            required
                            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] font-bold text-gray-900 placeholder:font-normal"
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Tags <span className="font-normal text-gray-400">(Press Enter to add)</span></label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map(tag => (
                                <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1">
                                    #{tag}
                                    <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-red-500"><X size={14} /></button>
                                </span>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            placeholder="Add generic tags..."
                            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6]"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your issue in detail..."
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
                            className="px-6 py-3 rounded-xl bg-[#8b5cf6] text-white font-bold hover:bg-[#7c3aed] shadow-lg shadow-purple-500/20 transition-all active:scale-95"
                        >
                            Post Question
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AskQuestionModal;
