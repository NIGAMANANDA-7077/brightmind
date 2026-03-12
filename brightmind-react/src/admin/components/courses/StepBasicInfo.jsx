import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

const StepBasicInfo = ({ data, updateData, teachers = [] }) => {
    const handleChange = (e) => {
        updateData({ ...data, [e.target.name]: e.target.value });
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full">
                    <label className="block text-sm font-bold text-gray-900 mb-2">Course Title</label>
                    <input
                        type="text"
                        name="title"
                        value={data.title}
                        onChange={handleChange}
                        placeholder="e.g. Advanced React Patterns"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/10 transition-all"
                    />
                </div>

                <div className="col-span-full">
                    <label className="block text-sm font-bold text-gray-900 mb-2">Subtitle / Short Description</label>
                    <textarea
                        name="subtitle"
                        value={data.subtitle}
                        onChange={handleChange}
                        rows="2"
                        placeholder="Brief summary of what students will learn..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/10 transition-all resize-none"
                    />
                </div>

                <div className="col-span-full">
                    <label className="block text-sm font-bold text-gray-900 mb-2">Assign Teacher</label>
                    <select
                        name="teacherId"
                        value={data.teacherId || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/10 transition-all"
                    >
                        <option value="">-- Select Teacher (Optional) --</option>
                        {teachers.map(t => (
                            <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Category</label>
                    <select
                        name="category"
                        value={data.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/10 transition-all"
                    >
                        <option value="">Select Category</option>
                        <option value="Development">Development</option>
                        <option value="Design">Design</option>
                        <option value="Business">Business</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Marketing">Marketing</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Level</label>
                    <select
                        name="level"
                        value={data.level}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/10 transition-all"
                    >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Price (₹)</label>
                    <input
                        type="number"
                        name="price"
                        value={data.price}
                        onChange={handleChange}
                        placeholder="499"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/10 transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Course Thumbnail</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-[#8b5cf6] hover:bg-[#8b5cf6]/5 transition-all cursor-pointer group">
                        <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-[#8b5cf6] mb-3 group-hover:scale-110 transition-transform">
                            <ImageIcon size={24} />
                        </div>
                        <p className="text-sm font-medium text-gray-700">Click to upload thumbnail</p>
                        <p className="text-xs text-gray-400 mt-1">Recommended: 1280x720px (JPG, PNG)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StepBasicInfo;
