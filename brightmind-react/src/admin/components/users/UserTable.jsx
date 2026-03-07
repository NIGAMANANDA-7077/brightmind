import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Edit, Trash2, Ban, Unlock, CheckCircle, Users as UsersIcon } from 'lucide-react';

const UserTable = ({ users, roleFilter, onStatusChange, onDelete, selectedIds = [], onSelectionChange, onAssignBatch }) => {
    const navigate = useNavigate();
    const filteredUsers = users.filter(u => u.role === roleFilter);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-left">
                            <th className="py-4 px-6 w-10">
                                <input
                                    type="checkbox"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            onSelectionChange(filteredUsers.map(u => u.id));
                                        } else {
                                            onSelectionChange([]);
                                        }
                                    }}
                                    checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0}
                                    className="rounded border-gray-300 text-[#8b5cf6] focus:ring-[#8b5cf6]"
                                />
                            </th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Batch</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Enrolled Courses</th>
                            <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                            <th className="py-4 px-6 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                            <tr key={user.id} className={`hover:bg-gray-50 transition-colors group ${selectedIds.includes(user.id) ? 'bg-purple-50/50' : ''}`}>
                                <td className="py-4 px-6">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(user.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                onSelectionChange([...selectedIds, user.id]);
                                            } else {
                                                onSelectionChange(selectedIds.filter(id => id !== user.id));
                                            }
                                        }}
                                        className="rounded border-gray-300 text-[#8b5cf6] focus:ring-[#8b5cf6]"
                                    />
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center text-white font-bold text-sm">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-600">
                                    {user.role}
                                </td>
                                <td className="py-4 px-6">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="py-4 px-6">
                                    {user.batch ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">
                                            {user.batch}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 text-xs italic">No Batch</span>
                                    )}
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-600">
                                    {user.courses.length > 0 ? user.courses.join(', ') : <span className="text-gray-400 italic">None</span>}
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-600">
                                    {user.joinedDate}
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <div className="flex items-center justify-end gap-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onAssignBatch(user)}
                                            className="p-2 hover:bg-gray-100 text-gray-500 rounded-lg transition-colors text-xs font-bold"
                                            title="Assign Batch"
                                        >
                                            <div className="flex items-center gap-1">
                                                <UsersIcon size={14} /> Batch
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => onStatusChange(user.id, user.status === 'Active' ? 'Suspended' : 'Active')}
                                            className={`p-2 rounded-lg transition-colors ${user.status === 'Active' ? 'hover:bg-red-50 hover:text-red-500' : 'hover:bg-green-50 hover:text-green-500'}`}
                                            title={user.status === 'Active' ? 'Suspend User' : 'Activate User'}
                                        >
                                            {user.status === 'Active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                                        </button>
                                        <button
                                            onClick={() => navigate(`/admin/users-edit/${user.id}`)}
                                            className="p-2 hover:bg-[#8b5cf6]/10 hover:text-[#8b5cf6] rounded-lg transition-colors"
                                            title="Edit User"
                                        >
                                            <Edit size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="8" className="py-8 text-center text-gray-500 italic">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserTable;
