import React, { useState } from 'react';
import { X, Check, Plus, Users as UsersIcon } from 'lucide-react';
import { useAdminGlobal } from '../../context/AdminGlobalContext';

const AssignBatchModal = ({ isOpen, onClose, selectedUserIds, batchOptions }) => {
    const { userActions, batchActions } = useAdminGlobal();
    const [selectedBatch, setSelectedBatch] = useState('');
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [newBatchName, setNewBatchName] = useState('');

    if (!isOpen) return null;

    const handleSave = () => {
        let batchToAssign = selectedBatch;

        if (isCreatingNew) {
            if (!newBatchName.trim()) {
                alert('Please enter a batch name');
                return;
            }
            const newBatch = batchActions.createBatch(newBatchName);
            batchToAssign = newBatch.name;
        } else if (!batchToAssign) {
            alert('Please select a batch');
            return;
        }

        // Action
        if (selectedUserIds.length === 1) {
            userActions.assignBatchToUser(selectedUserIds[0], batchToAssign);
            alert(`Batch "${batchToAssign}" assigned to user.`);
        } else {
            userActions.assignBatchToUsers(selectedUserIds, batchToAssign);
            alert(`Batch "${batchToAssign}" assigned to ${selectedUserIds.length} users.`);
        }

        onClose();
        // Reset
        setSelectedBatch('');
        setIsCreatingNew(false);
        setNewBatchName('');
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity"
                onClick={onClose}
            ></div>

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-scaleUp border border-gray-100">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <UsersIcon size={20} className="text-[#8b5cf6]" />
                            Assign Batch
                        </h3>
                        <button onClick={onClose}><X size={20} className="text-gray-400 hover:text-gray-600" /></button>
                    </div>

                    <div className="p-6 space-y-4">
                        <p className="text-sm text-gray-500">
                            Assigning batch to <span className="font-bold text-gray-900">{selectedUserIds.length} users</span>.
                        </p>

                        {!isCreatingNew ? (
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Select Batch</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none"
                                    value={selectedBatch}
                                    onChange={(e) => setSelectedBatch(e.target.value)}
                                >
                                    <option value="">-- Select Batch --</option>
                                    {batchOptions.map(b => (
                                        <option key={b.id} value={b.name}>{b.name}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => setIsCreatingNew(true)}
                                    className="text-sm text-[#8b5cf6] font-bold flex items-center gap-1 hover:underline mt-2"
                                >
                                    <Plus size={14} /> Create New Batch
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2 bg-purple-50 p-4 rounded-xl border border-purple-100">
                                <label className="text-sm font-bold text-purple-900">New Batch Name</label>
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="e.g. Evening Batch 2024"
                                    className="w-full px-4 py-2 border border-purple-200 rounded-xl focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none"
                                    value={newBatchName}
                                    onChange={(e) => setNewBatchName(e.target.value)}
                                />
                                <button
                                    onClick={() => setIsCreatingNew(false)}
                                    className="text-xs text-purple-600 font-bold hover:underline mt-2 block"
                                >
                                    Cancel & Select Existing
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 rounded-b-2xl">
                        <button onClick={onClose} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-[#8b5cf6] text-white font-bold rounded-lg hover:bg-[#7c3aed] transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2"
                        >
                            <Check size={18} /> Save
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AssignBatchModal;
