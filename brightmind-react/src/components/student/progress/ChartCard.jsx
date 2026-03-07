import React from 'react';

const ChartCard = ({ title, children, action }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
                {action}
            </div>
            <div className="flex-1 w-full min-h-[250px] relative">
                {children}
            </div>
        </div>
    );
};

export default ChartCard;
