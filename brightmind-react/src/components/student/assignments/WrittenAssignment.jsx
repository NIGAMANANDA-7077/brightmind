import React, { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

const WrittenAssignment = ({ assignment, onSubmit }) => {
    const [content, setContent] = useState('');
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

    const handleSubmit = () => {
        if (content.trim()) {
            onSubmit(content);
        }
    };

    if (assignment.status === 'Submitted' || assignment.status === 'Graded') {
        return (
            <div className="space-y-6">
                <div className="bg-green-50 p-6 rounded-3xl border border-green-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-green-900">Assignment Submitted</h3>
                        <p className="text-green-700 text-sm">Submitted on {assignment.submittedDate}</p>
                    </div>
                </div>

                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200">
                    <h4 className="font-bold text-gray-500 text-sm uppercase tracking-wider mb-4">Your Submission</h4>
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap font-serif text-lg">
                        {assignment.submission.content}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your answer here..."
                    className="w-full min-h-[400px] p-6 rounded-3xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] resize-none font-serif text-lg leading-relaxed text-gray-800"
                />
                <div className="absolute bottom-6 right-6 text-gray-400 font-medium text-sm">
                    {wordCount} words
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={!content.trim()}
                    className="flex items-center gap-2 px-8 py-4 bg-[#8b5cf6] text-white rounded-xl font-bold hover:bg-[#7c3aed] transition-all shadow-lg shadow-purple-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send size={20} />
                    Submit Essay
                </button>
            </div>
        </div>
    );
};

export default WrittenAssignment;
