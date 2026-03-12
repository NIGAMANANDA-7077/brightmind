import React, { useState } from 'react';
import { useAdminGlobal } from '../context/AdminGlobalContext';
import UserTable from '../components/users/UserTable';
import AssignBatchModal from '../components/users/AssignBatchModal';
import { Search, UserPlus, Filter, Layers, CheckSquare, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Users = () => {
    const { users, loading, userActions, batches, batchActions } = useAdminGlobal();
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#8b5cf6]" size={40} />
            </div>
        );
    }

    // State
    const [activeTab, setActiveTab] = useState('Student');
    const [searchTerm, setSearchTerm] = useState('');
    const [batchFilter, setBatchFilter] = useState('All');

    const [selectedIds, setSelectedIds] = useState([]);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

    // Derived Data
    const filteredUsers = users.filter(u => {
        const matchesRole = u.role === activeTab;
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const hasBatch = u.enrolledBatches?.some(b => b.batchName === batchFilter || b.name === batchFilter) || u.batch === batchFilter;
        const matchesBatch = batchFilter === 'All' || hasBatch;

        return matchesRole && matchesSearch && matchesBatch;
    });

    const studentsInBatchCount = batchFilter !== 'All'
        ? users.filter(u => u.role === 'Student' && (u.enrolledBatches?.some(b => b.batchName === batchFilter || b.name === batchFilter) || u.batch === batchFilter)).length
        : users.filter(u => u.role === 'Student').length;

    // Handlers
    const handleAssignBatch = (user) => {
        setSelectedIds([user.id]);
        setIsAssignModalOpen(true);
    };

    const handleBulkAssign = () => {
        if (selectedIds.length === 0) return;
        setIsAssignModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-fadeIn max-w-[1600px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500">Manage students, teachers, and administrators</p>
                </div>
                <button
                    onClick={() => navigate('/admin/users-create')}
                    className="flex items-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-purple-500/20"
                >
                    <UserPlus size={20} />
                    Add New User
                </button>
            </div>

            {/* Batch Stats (Only for Student tab) */}
            {activeTab === 'Student' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Layers size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Batches</p>
                            <h3 className="text-2xl font-bold text-gray-900">{batches.length}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <CheckSquare size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Students in {batchFilter === 'All' ? 'Total' : batchFilter}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{studentsInBatchCount}</h3>
                        </div>
                    </div>
                </div>
            )}

            {/* Controls & Tabs */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
                {/* Tabs */}
                <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl w-full xl:w-auto overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => { setActiveTab('Student'); setSelectedIds([]); }}
                        className={`flex-1 xl:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'Student' ? 'bg-white shadow-sm text-[#8b5cf6]' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Students
                    </button>
                    <button
                        onClick={() => { setActiveTab('Teacher'); setSelectedIds([]); }}
                        className={`flex-1 xl:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'Teacher' ? 'bg-white shadow-sm text-[#8b5cf6]' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Teachers
                    </button>
                </div>

                {/* Filters & Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">

                    {/* Bulk Action */}
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBulkAssign}
                            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl text-sm font-bold hover:bg-purple-200 transition-colors animate-fadeIn whitespace-nowrap"
                        >
                            Assign Batch ({selectedIds.length})
                        </button>
                    )}

                    {/* Batch Filter */}
                    {activeTab === 'Student' && (
                        <select
                            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 text-sm font-medium text-gray-600 cursor-pointer w-full sm:w-auto"
                            value={batchFilter}
                            onChange={(e) => setBatchFilter(e.target.value)}
                        >
                            <option value="All">All Batches</option>
                            {batches.map(b => (
                                <option key={b.id} value={b.name}>{b.name}</option>
                            ))}
                        </select>
                    )}

                    {/* Search */}
                    <div className="relative flex-1 sm:min-w-[240px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search user..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            {/* Table */}
            <UserTable
                users={filteredUsers}
                roleFilter={activeTab}
                onStatusChange={userActions.updateUserStatus}
                onDelete={userActions.deleteUser}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                onAssignBatch={handleAssignBatch}
            />

            <AssignBatchModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                selectedUserIds={selectedIds}
                batchOptions={batches}
            />
        </div>
    );
};

export default Users;
