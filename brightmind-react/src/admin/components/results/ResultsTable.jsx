import React from 'react';
import { useAdminResults } from '../../context/AdminResultsContext';
import { Layers, ChevronRight, Award, Trophy } from 'lucide-react';

const ResultsTable = ({ onViewDetails }) => {
    const { results, groupByBatch, groupedResults, toggleGroupByBatch } = useAdminResults();

    const TableHeader = () => (
        <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
                <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                {!groupByBatch && <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Batch</th>}
                <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Exam</th>
                <th className="py-4 px-6 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">OMR</th>
                <th className="py-4 px-6 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Assign.</th>
                <th className="py-4 px-6 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Quiz</th>
                <th className="py-4 px-6 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="py-4 px-6 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
        </thead>
    );

    const ResultRow = ({ result }) => (
        <tr
            onClick={() => onViewDetails(result)}
            className="hover:bg-[#8b5cf6]/5 transition-colors cursor-pointer group border-b border-gray-50 last:border-0"
        >
            <td className="py-4 px-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${result.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                        result.rank === 2 ? 'bg-gray-100 text-gray-700' :
                            result.rank === 3 ? 'bg-orange-100 text-orange-700' : 'text-gray-500'}
                `}>
                    {result.rank <= 3 ? <Trophy size={14} /> : `#${result.rank}`}
                </div>
            </td>
            <td className="py-4 px-6">
                <div>
                    <p className="font-bold text-gray-900 group-hover:text-[#8b5cf6] transition-colors">{result.studentName}</p>
                    <p className="text-xs text-gray-500">{result.studentId}</p>
                </div>
            </td>
            {!groupByBatch && (
                <td className="py-4 px-6">
                    <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-600 whitespace-nowrap">
                        {result.batch}
                    </span>
                </td>
            )}
            <td className="py-4 px-6 text-sm font-medium text-gray-700">
                {result.examName}
            </td>
            <td className="py-4 px-6 text-center text-sm text-gray-600">{result.omrScore}</td>
            <td className="py-4 px-6 text-center text-sm text-gray-600">{result.assignmentScore}</td>
            <td className="py-4 px-6 text-center text-sm text-gray-600">{result.quizScore}</td>
            <td className="py-4 px-6 text-center">
                <span className="font-bold text-[#8b5cf6]">{result.totalScore}</span>
            </td>
            <td className="py-4 px-6 text-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${result.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {result.status}
                </span>
            </td>
        </tr>
    );

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header / Controls */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Award size={20} className="text-[#8b5cf6]" />
                    Performance Breakdown
                </h3>
                <button
                    onClick={toggleGroupByBatch}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all border
                        ${groupByBatch
                            ? 'bg-[#8b5cf6] text-white border-[#8b5cf6] shadow-sm'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
                    `}
                >
                    <Layers size={16} />
                    Group by Batch
                </button>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <TableHeader />
                    <tbody className="divide-y divide-gray-100">
                        {groupByBatch ? (
                            Object.values(groupedResults || {}).map((group) => (
                                <React.Fragment key={group.batchName}>
                                    {/* Batch Header Row */}
                                    <tr className="bg-gray-50/80">
                                        <td colSpan="9" className="py-3 px-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm font-bold text-[#8b5cf6] shadow-sm">
                                                        {group.batchName}
                                                    </span>
                                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                        {group.items.length} Students
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                                                    <span>Avg: <strong className="text-gray-900">{group.stats.avg}</strong></span>
                                                    <span>Pass Rate: <strong className="text-green-600">{group.stats.pass}%</strong></span>
                                                    <span>Highest: <strong className="text-[#8b5cf6]">{group.stats.high}</strong></span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    {/* Student Rows */}
                                    {group.items.map(result => (
                                        <ResultRow key={result.id} result={result} />
                                    ))}
                                </React.Fragment>
                            ))
                        ) : (
                            results.map(result => (
                                <ResultRow key={result.id} result={result} />
                            ))
                        )}

                        {results.length === 0 && (
                            <tr>
                                <td colSpan="9" className="py-12 text-center text-gray-500">
                                    No results found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResultsTable;
