import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, MessageSquare } from 'lucide-react';
import { useForum } from '../../context/ForumContext';
import { useCourse } from '../../context/CourseContext';
import ThreadCard from '../../components/student/forum/ThreadCard';
import AskQuestionModal from '../../components/student/forum/AskQuestionModal';

const CourseForum = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { getThreadsByCourse, addThread } = useForum();
    const { getCourse, courses } = useCourse();

    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const course = getCourse(courseId);
    const courseThreads = getThreadsByCourse(courseId);

    const filteredThreads = courseThreads.filter(thread =>
        thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        thread.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!course) return <div className="p-8">Course not found</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium mb-4"
            >
                <ArrowLeft size={20} /> Back to Course
            </button>

            {/* Course Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-purple-300 bg-purple-500/20 px-3 py-1 rounded-lg border border-purple-500/30 mb-3 inline-block">
                                Course Forum
                            </span>
                            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                            <p className="text-gray-400 max-w-2xl text-sm leading-relaxed">
                                Discuss lessons, share insights, and ask questions specifically about this course.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-[#8b5cf6] text-white rounded-xl font-bold hover:bg-[#7c3aed] transition-all shadow-lg shadow-purple-500/20 active:scale-95 whitespace-nowrap"
                        >
                            <Plus size={20} />
                            Ask Question
                        </button>
                    </div>
                </div>

                {/* Decorative blob */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#8b5cf6] rounded-full blur-[100px] opacity-30"></div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder={`Search in ${course.title} discussions...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 focus:border-[#8b5cf6] transition-all"
                />
            </div>

            {/* Threads List */}
            <div className="space-y-4">
                {filteredThreads.length > 0 ? (
                    filteredThreads.map(thread => (
                        <ThreadCard key={thread.id} thread={thread} />
                    ))
                ) : (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <MessageSquare size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No discussions yet</h3>
                        <p className="text-gray-500 mb-6">Be the first to ask a question in this course!</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-[#8b5cf6] font-bold hover:underline"
                        >
                            Start a discussion
                        </button>
                    </div>
                )}
            </div>

            <AskQuestionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={addThread}
                courses={courses}
                initialCourseId={courseId}
            />
        </div>
    );
};

export default CourseForum;
