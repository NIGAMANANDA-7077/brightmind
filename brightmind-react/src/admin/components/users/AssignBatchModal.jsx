import React, { useState } from 'react';
import { X, Check, Plus, Users as UsersIcon } from 'lucide-react';
import { useAdminGlobal } from '../../context/AdminGlobalContext';

const AssignBatchModal = ({ isOpen, onClose, selectedUserIds, batchOptions }) => {
    const { userActions } = useAdminGlobal();
    const [selectedBatchId, setSelectedBatchId] = useState('');

    if (!isOpen) return null;

    const handleSave = () => {
        if (!selectedBatchId) {
            alert('Please select a batch');
            return;
        }

        const batchObj = batchOptions.find(b => String(b.id) === String(selectedBatchId));
        if (!batchObj) return;

        // The property in batch options is typically name (from context map) or batchName (from model). It's safest to check both.
        const batchName = batchObj.batchName || batchObj.name;

        if (selectedUserIds.length === 1) {
            userActions.assignBatchToUser(selectedUserIds[0], selectedBatchId, batchName);
            alert(`Batch "${batchName}" assigned to user.`);
        } else {
            userActions.assignBatchToUsers(selectedUserIds, selectedBatchId, batchName);
            alert(`Batch "${batchName}" assigned to ${selectedUserIds.length} users.`);
        }

        onClose();
        setSelectedBatchId('');
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

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Select Batch</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none"
                                value={selectedBatchId}
                                onChange={(e) => setSelectedBatchId(e.target.value)}
                            >
                                <option value="">-- Select Batch --</option>
                                {batchOptions.map(b => (
                                    <option key={b.id} value={b.id}>{b.batchName || b.name}</option>
                                ))}
                            </select>
                        </div>
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
