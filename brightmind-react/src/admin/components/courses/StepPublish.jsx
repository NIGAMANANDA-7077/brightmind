import React from 'react';
import { Upload, Eye, Lock } from 'lucide-react';

const StepPublish = ({ data, updateData }) => {
    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
            <div className="text-center">
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <Upload size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Ready to Publish?</h2>
                <p className="text-gray-500">Review your settings before making the course live.</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-6">
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 text-[#8b5cf6] rounded-lg">
                            <Eye size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Visibility</h3>
                            <p className="text-sm text-gray-500">Who can see this course?</p>
                        </div>
                    </div>
                    <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none">
                        <option>Public (Everyone)</option>
                        <option>Private (Invite Only)</option>
                        <option>Hidden (Draft)</option>
                    </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Lock size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Access Control</h3>
                            <p className="text-sm text-gray-500">Is this a free or paid course?</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                        <button className="px-4 py-1.5 bg-white shadow-sm text-gray-900 rounded-md text-xs font-bold transition-all">
                            Paid ({data.price ? `₹${data.price}` : 'Free'})
                        </button>
                        <button className="px-4 py-1.5 text-gray-500 hover:text-gray-900 rounded-md text-xs font-medium transition-all">
                            Free
                        </button>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Course Summary</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex justify-between">
                        <span>Total Modules:</span>
                        <span className="font-bold text-gray-900">{data.modules.length}</span>
                    </li>
                    <li className="flex justify-between">
                        <span>Total Lessons:</span>
                        <span className="font-bold text-gray-900">
                            {data.modules.reduce((acc, mod) => acc + mod.lessons.length, 0)}
                        </span>
                    </li>
                    <li className="flex justify-between">
                        <span>Estimated Duration:</span>
                        <span className="font-bold text-gray-900">~ 2h 30m</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default StepPublish;
