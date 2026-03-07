import React from 'react';

const SkillProgress = ({ skill }) => {
    return (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-700 text-sm">{skill.name}</span>
                <span className="font-bold text-gray-500 text-xs">{skill.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${skill.progress}%`, backgroundColor: skill.color }}
                ></div>
            </div>
        </div>
    );
};

export default SkillProgress;
