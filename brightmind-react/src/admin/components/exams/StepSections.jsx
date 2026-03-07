import React from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

const StepSections = ({ data, updateData }) => {
    const addSection = () => {
        const newSection = {
            id: Date.now(),
            name: 'New Section',
            marksPerQuestion: 1,
            questions: []
        };
        updateData({ ...data, sections: [...data.sections, newSection] });
    };

    const removeSection = (id) => {
        updateData({ ...data, sections: data.sections.filter(s => s.id !== id) });
    };

    const updateSection = (id, field, value) => {
        const updatedSections = data.sections.map(s =>
            s.id === id ? { ...s, [field]: value } : s
        );
        updateData({ ...data, sections: updatedSections });
    };

    return (
        <div className="p-8 max-w-4xl mx-auto animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Configure Sections</h2>
                <button
                    onClick={addSection}
                    className="flex items-center gap-2 bg-[#8b5cf6] text-white px-4 py-2 rounded-lg hover:bg-[#7c3aed] transition-colors text-sm font-medium"
                >
                    <Plus size={16} /> Add Section
                </button>
            </div>

            <div className="space-y-4">
                {data.sections.map((section, index) => (
                    <div key={section.id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <div className="text-gray-400 cursor-grab">
                            <GripVertical size={20} />
                        </div>

                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Section Name</label>
                            <input
                                type="text"
                                value={section.name}
                                onChange={(e) => updateSection(section.id, 'name', e.target.value)}
                                className="w-full bg-white border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20"
                            />
                        </div>

                        <div className="w-32">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Marks / Q</label>
                            <input
                                type="number"
                                value={section.marksPerQuestion}
                                onChange={(e) => updateSection(section.id, 'marksPerQuestion', parseInt(e.target.value))}
                                className="w-full bg-white border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20"
                            />
                        </div>

                        <div className="w-24 text-center">
                            <span className="block text-xs font-bold text-gray-500 mb-1">Questions</span>
                            <span className="text-lg font-bold text-gray-900">{section.questions.length}</span>
                        </div>

                        <button
                            onClick={() => removeSection(section.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-5"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}

                {data.sections.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-500">
                        No sections added. Add a section to start adding questions.
                    </div>
                )}
            </div>
        </div>
    );
};

export default StepSections;
