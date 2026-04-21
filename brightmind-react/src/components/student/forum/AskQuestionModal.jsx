import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Loader, AlertCircle } from 'lucide-react';
import api from '../../../utils/axiosConfig';

const AskQuestionModal = ({ isOpen, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState([]);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    // Multi-batch state
    const [myBatches, setMyBatches] = useState([]);
    const [batchId, setBatchId] = useState('');
    const [loadingBatches, setLoadingBatches] = useState(false);

    // Fetch student's batches whenever modal opens
    useEffect(() => {
        if (!isOpen) return;
        const fetchBatches = async () => {
            setLoadingBatches(true);
            try {
                const res = await api.get('/batches/student/my-batches');
                const data = res.data.data || [];
                setMyBatches(data);
                // Auto-select if only one batch
                if (data.length === 1) setBatchId(data[0].id);
            } catch (err) {
                console.error('Failed to fetch student batches:', err);
            } finally {
                setLoadingBatches(false);
            }
        };
        fetchBatches();
    }, [isOpen]);

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

    const validate = () => {
        const newErrors = {};
        if (!title.trim()) newErrors.title = 'Title is required.';
        if (!description.trim()) newErrors.description = 'Description is required.';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});
        setSubmitting(true);
        try {
            const selectedBatch = myBatches.find(b => b.id === batchId);
            await onSubmit({
                title: title.trim(),
                description: description.trim(),
                batchId: batchId || undefined,
                batchName: selectedBatch ? selectedBatch.batchName : undefined,
                tags
            });
            // Reset and close only on success
            setTitle('');
            setDescription('');
            setBatchId(myBatches.length === 1 ? myBatches[0].id : '');
            setTags([]);
            setTagInput('');
            setErrors({});
            onClose();
        } catch (err) {
            setSubmitError(err?.response?.data?.message || 'Failed to post question. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const isMultiBatch = myBatches.length > 1;
    const singleBatch = myBatches.length === 1 ? myBatches[0] : null;

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
                    {/* Batch field */}
                    {loadingBatches ? (
                        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
                            <Loader size={16} className="animate-spin text-[#8b5cf6]" />
                            <span className="text-sm text-gray-500">Loading your batches...</span>
                        </div>
                    ) : isMultiBatch ? (
                        /* Multiple batches → show dropdown */
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Select Batch
                                <span className="ml-2 text-xs font-normal text-gray-400">Your discussion will only be visible to this batch</span>
                            </label>
                            <select
                                value={batchId}
                                onChange={(e) => setBatchId(e.target.value)}
                                required
                                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] font-medium text-gray-600"
                            >
                                <option value="" disabled>Choose a batch</option>
                                {myBatches.map(batch => (
                                    <option key={batch.id} value={batch.id}>{batch.batchName}</option>
                                ))}
                            </select>
                        </div>
                    ) : singleBatch ? (
                        /* Single batch → auto-assigned info banner */
                        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
                            <span className="text-xs font-bold text-blue-500 uppercase tracking-wide">Your Batch</span>
                            <span className="text-sm font-bold text-blue-700">{singleBatch.batchName}</span>
                            <span className="ml-auto text-xs text-blue-400">Auto-assigned</span>
                        </div>
                    ) : null}

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors(p => ({ ...p, title: '' })); }}
                            placeholder="e.g., How to implement dark mode in React?"
                            className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] font-bold text-gray-900 placeholder:font-normal transition-colors ${errors.title ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                        />
                        {errors.title && (
                            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle size={12} /> {errors.title}
                            </p>
                        )}
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
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => { setDescription(e.target.value); if (errors.description) setErrors(p => ({ ...p, description: '' })); }}
                            placeholder="Describe your issue in detail..."
                            rows={6}
                            className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] resize-none transition-colors ${errors.description ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                        />
                        {errors.description && (
                            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle size={12} /> {errors.description}
                            </p>
                        )}
                    </div>

                    {submitError && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            <AlertCircle size={16} />
                            {submitError}
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={(isMultiBatch && !batchId) || submitting}
                            className="px-6 py-3 rounded-xl bg-[#8b5cf6] text-white font-bold hover:bg-[#7c3aed] shadow-lg shadow-purple-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                        >
                            {submitting ? <><Loader size={16} className="animate-spin" /> Posting...</> : 'Post Question'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AskQuestionModal;

