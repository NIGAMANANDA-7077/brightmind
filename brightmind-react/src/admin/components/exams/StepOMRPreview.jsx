import React from 'react';
import { FileText, Clock, Award, Printer } from 'lucide-react';

const StepOMRPreview = ({ data }) => {
    const totalQuestions = data.sections.reduce((acc, s) => acc + s.questions.length, 0);

    return (
        <div className="flex h-[600px] animate-fadeIn">
            {/* Left: Exam Summary */}
            <div className="w-1/3 bg-gray-900 p-8 text-white flex flex-col">
                <h2 className="text-2xl font-bold mb-1">Exam Preview</h2>
                <p className="text-gray-400 text-sm mb-8">Summary of your exam configuration</p>

                <div className="space-y-6">
                    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Title</h3>
                        <p className="font-semibold">{data.title || 'Untitled Exam'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                            <div className="flex items-center gap-2 text-gray-400 mb-1">
                                <Clock size={16} /> <span className="text-xs font-bold">Duration</span>
                            </div>
                            <p className="font-semibold text-xl">{data.timeLimit} <span className="text-sm font-normal">min</span></p>
                        </div>
                        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                            <div className="flex items-center gap-2 text-gray-400 mb-1">
                                <Award size={16} /> <span className="text-xs font-bold">Total Marks</span>
                            </div>
                            <p className="font-semibold text-xl">{data.totalMarks}</p>
                        </div>
                    </div>

                    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Structure</h3>
                        <div className="space-y-3">
                            {data.sections.map((s, i) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                    <span>{s.name}</span>
                                    <span className="font-bold bg-gray-700 px-2 py-0.5 rounded">{s.questions.length} Qs</span>
                                </div>
                            ))}
                            <div className="border-t border-gray-700 mt-3 pt-3 flex justify-between items-center font-bold text-purple-400">
                                <span>Total Questions</span>
                                <span>{totalQuestions}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: OMR Visual Preview */}
            <div className="w-2/3 bg-gray-100 p-8 overflow-y-auto">
                <div className="bg-white p-8 shadow-xl min-h-full max-w-2xl mx-auto relative paper-pattern">
                    {/* OMR Header Mock */}
                    <div className="border border-black p-4 mb-6 flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-serif font-bold text-black uppercase tracking-widest">{data.title || 'MOCK EXAM'}</h1>
                            <p className="font-serif text-sm mt-1">COURSE: {data.course || 'GENERAL'}</p>
                        </div>
                        <div className="text-right">
                            <div className="border border-black px-4 py-2 inline-block">
                                <p className="text-xs font-bold">OMR SHEET NO.</p>
                                <p className="text-xl font-mono text-red-600">102938</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-8 mb-6">
                        <div className="border border-black p-2 w-1/3">
                            <p className="text-[10px] font-bold mb-1">CANDIDATE NAME</p>
                            <div className="h-8 bg-gray-100"></div>
                        </div>
                        <div className="border border-black p-2 w-1/3">
                            <p className="text-[10px] font-bold mb-1">ROLL NO</p>
                            <div className="flex gap-1">
                                {[...Array(6)].map((_, i) => <div key={i} className="w-6 h-6 border border-gray-300 bg-white"></div>)}
                            </div>
                        </div>
                    </div>

                    <p className="text-center font-bold border-b-2 border-black mb-6 pb-2">INSTRUCTIONS: Darken the bubbles completely. Use HB Pencil or Blue/Black Pen.</p>

                    {/* OMR Bubbles Grid */}
                    <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                        {data.sections.map((section) => (
                            <div key={section.id} className="col-span-full mb-2">
                                <h4 className="font-bold text-sm bg-black text-white px-2 py-1 mb-2 inline-block">{section.name.toUpperCase()}</h4>
                                <div className="grid grid-cols-2 gap-x-8">
                                    {section.questions.length > 0 ? (
                                        section.questions.map((_, qIndex) => (
                                            <div key={qIndex} className="flex items-center gap-3 mb-1.5 text-xs font-mono">
                                                <span className="w-6 text-right font-bold">{qIndex + 1}.</span>
                                                <div className="flex gap-2">
                                                    {['A', 'B', 'C', 'D'].map(opt => (
                                                        <div key={opt} className="w-6 h-6 rounded-full border border-gray-400 flex items-center justify-center text-[10px] font-bold text-gray-500 hover:bg-black hover:text-white cursor-pointer transition-colors">
                                                            {opt}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-red-500 italic py-2">No questions defined for this section.</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="absolute bottom-4 right-4 text-[10px] text-gray-400">
                        GENERATED BY BrightMind  CLASSES LMS
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StepOMRPreview;
