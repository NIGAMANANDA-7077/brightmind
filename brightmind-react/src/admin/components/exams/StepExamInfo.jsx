import React from 'react';

const StepExamInfo = ({ data, updateData }) => {
    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        updateData({ ...data, [e.target.name]: value });
    };

    return (
        <div className="p-8 max-w-3xl mx-auto animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Exam Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full">
                    <label className="block text-sm font-bold text-gray-900 mb-2">Exam Title</label>
                    <input
                        type="text"
                        name="title"
                        value={data.title}
                        onChange={handleChange}
                        placeholder="e.g. JEE Mains Mock Test - 01"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Target Course</label>
                    <select
                        name="course"
                        value={data.course}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
                    >
                        <option value="">Select Course</option>
                        <option value="Physics 101">Physics 101</option>
                        <option value="Chemistry 201">Chemistry 201</option>
                        <option value="JEE Advanced">JEE Advanced Bundle</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Time Limit (Minutes)</label>
                    <input
                        type="number"
                        name="timeLimit"
                        value={data.timeLimit}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Total Marks</label>
                    <input
                        type="number"
                        name="totalMarks"
                        value={data.totalMarks}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all"
                    />
                </div>

                <div className="col-span-full pt-4">
                    <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                            type="checkbox"
                            name="negativeMarking"
                            checked={data.negativeMarking}
                            onChange={handleChange}
                            className="w-5 h-5 text-[#8b5cf6] rounded focus:ring-[#8b5cf6]"
                        />
                        <div>
                            <span className="font-bold text-gray-900 block">Enable Negative Marking</span>
                            <span className="text-sm text-gray-500">Deduct marks for incorrect answers (usually 1/4th)</span>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default StepExamInfo;
