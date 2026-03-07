import React from 'react';
import { Search, Filter, Download } from 'lucide-react';
import { useAdminResults } from '../../context/AdminResultsContext';

const ResultsFilterBar = () => {
    const {
        filters,
        updateFilters,
        uniqueCourses,
        uniqueExams,
        uniqueBatches,
        exportResults
    } = useAdminResults();

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">

            {/* Filters Group */}
            <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto flex-1">
                {/* Search */}
                <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search student name or ID..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium"
                        value={filters.search}
                        onChange={(e) => updateFilters('search', e.target.value)}
                    />
                </div>

                {/* Dropdowns */}
                <select
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium min-w-[160px] cursor-pointer"
                    value={filters.course}
                    onChange={(e) => updateFilters('course', e.target.value)}
                >
                    <option value="" disabled>Course</option>
                    {uniqueCourses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <select
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium min-w-[160px] cursor-pointer"
                    value={filters.exam}
                    onChange={(e) => updateFilters('exam', e.target.value)}
                >
                    <option value="" disabled>Exam</option>
                    {uniqueExams.map(e => <option key={e} value={e}>{e}</option>)}
                </select>

                <select
                    className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium min-w-[160px] cursor-pointer"
                    value={filters.batch}
                    onChange={(e) => updateFilters('batch', e.target.value)}
                >
                    <option value="" disabled>Batch</option>
                    {uniqueBatches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <button
                    onClick={exportResults}
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl font-bold text-gray-600 transition-colors"
                >
                    <Download size={18} />
                    <span className="hidden md:inline">Export CSV</span>
                </button>
            </div>
        </div>
    );
};

export default ResultsFilterBar;
