import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const StatCard = ({ stat }) => {
    const Icon = stat.icon;
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                    <Icon size={24} className={stat.color} />
                </div>
                <div className="flex items-center gap-1 text-green-500 bg-green-50 px-2 py-1 rounded-lg text-xs font-bold">
                    <ArrowUpRight size={12} />
                    {stat.change}
                </div>
            </div>
            <div>
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-wide">{stat.label}</p>
            </div>
        </div>
    );
};

export default StatCard;
