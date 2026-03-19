import React, { useState } from 'react';
import { Search, Filter, Plus, MessageSquare } from 'lucide-react';
import { useForum } from '../../context/ForumContext';
import { useUser } from '../../context/UserContext';
import ThreadCard from '../../components/student/forum/ThreadCard';
import AskQuestionModal from '../../components/student/forum/AskQuestionModal';
import StartDiscussionModal from '../../components/student/forum/StartDiscussionModal';
import { useBatch } from '../../context/BatchContext';

const ForumHome = () => {
    const { threads, addThread } = useForum();
    const { user } = useUser();
    const { myBatch } = useBatch();
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isTeacher = user?.role === 'Teacher';
    const filters = ['All', 'My Questions', 'Unanswered', 'Solved'];

    const filteredThreads = threads.filter(thread => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q ||
            thread.title?.toLowerCase().includes(q) ||
            thread.description?.toLowerCase().includes(q) ||
            (thread.tags && thread.tags.some(t => t.toLowerCase().includes(q))) ||
            thread.courseName?.toLowerCase().includes(q) ||
            thread.batchName?.toLowerCase().includes(q);
        const matchesFilter = filter === 'All' ||
            (filter === 'My Questions' && thread.authorId === user?.id) ||
            (filter === 'Solved' && thread.status === 'Resolved') ||
            (filter === 'Unanswered' && (thread.repliesCount || 0) === 0);
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        Discussion Forum
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isTeacher
                            ? 'Manage discussions across your batches.'
                            : 'Join the community conversation, ask questions, and share knowledge.'
                        }
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#8b5cf6] text-white rounded-xl font-bold hover:bg-[#7c3aed] transition-all shadow-lg shadow-purple-500/20 active:scale-95"
                >
                    <Plus size={20} />
                    {isTeacher ? 'Start Discussion' : 'Ask Question'}
                </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by title, tags, course or batch..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] transition-all"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                    {filters.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${filter === f
                                ? 'bg-gray-900 text-white border-gray-900'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Threads List */}
            <div className="space-y-4">
                {filteredThreads.length > 0 ? (
                    filteredThreads.map(thread => (
                        <ThreadCard key={thread.id} thread={thread} />
                    ))
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 border-dashed">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <MessageSquare size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No discussions found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>

            {/* Teacher: Start Discussion Modal */}
            {isTeacher ? (
                <StartDiscussionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={addThread}
                />
            ) : (
                <AskQuestionModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={addThread}
                />
            )}
        </div>
    );
};

export default ForumHome;
