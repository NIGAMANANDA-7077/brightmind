import React, { useState } from 'react';
import { teacherStudents, teacherCourses } from '../data/teacherMock';
import { Users, Search, BookOpen } from 'lucide-react';

// =========================================================
// Teacher Students — minimal: name + enrolled courses
// =========================================================

const Students = () => {
    const [search, setSearch] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('all');

    const filtered = teacherStudents.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
        const matchCourse = selectedCourse === 'all' || s.enrolledCourses.includes(selectedCourse);
        return matchSearch && matchCourse;
    });

    const getCourseNames = (ids) =>
        ids.map(id => teacherCourses.find(c => c.id === id)?.title?.split('—')[0].trim() || id);

    return (
        <div className="space-y-5 animate-fadeIn pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Students</h1>
                    <p className="text-gray-500">{teacherStudents.length} students enrolled in your courses</p>
                </div>
                <div className="bg-[#8b5cf6]/10 text-[#8b5cf6] text-sm font-bold px-4 py-2 rounded-xl">
                    {filtered.length} showing
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search student by name..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/20"
                    />
                </div>
                <select
                    value={selectedCourse}
                    onChange={e => setSelectedCourse(e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 bg-white"
                >
                    <option value="all">All Courses</option>
                    {teacherCourses.map(c => (
                        <option key={c.id} value={c.id}>{c.title.split('—')[0].trim()}</option>
                    ))}
                </select>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                                <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="py-4 px-6 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Enrolled Courses</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((student, idx) => {
                                const courseNames = getCourseNames(student.enrolledCourses);
                                return (
                                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6 text-sm text-gray-400 font-medium">{idx + 1}</td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={student.avatar}
                                                    alt={student.name}
                                                    className="w-9 h-9 rounded-full border border-gray-100 object-cover"
                                                />
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{student.name}</p>
                                                    <p className="text-xs text-gray-400">{student.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-wrap gap-1.5">
                                                {courseNames.map((name, i) => (
                                                    <span key={i} className="flex items-center gap-1 text-xs font-medium bg-[#8b5cf6]/8 text-[#8b5cf6] border border-[#8b5cf6]/15 px-2.5 py-1 rounded-full">
                                                        <BookOpen size={10} />
                                                        {name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="text-center py-16 text-gray-400">
                            <Users size={36} className="mx-auto mb-3 opacity-20" />
                            <p className="text-sm font-medium">No students found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Students;
