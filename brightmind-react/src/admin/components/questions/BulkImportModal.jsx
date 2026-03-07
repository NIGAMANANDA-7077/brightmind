import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAdminExams } from '../../context/AdminExamContext';

const BulkImportModal = ({ isOpen, onClose }) => {
    const { addQuestion } = useAdminExams();
    const [file, setFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, processing, success, error

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setStatus('idle');
        }
    };

    const handleImport = () => {
        if (!file) return;

        setIsProcessing(true);
        setStatus('processing');

        // Simulate Parsing Delay
        setTimeout(() => {
            // Mock Import 3 Questions
            const mockImported = [
                { id: Date.now(), text: 'Imported Question 1', type: 'MCQ', topic: 'General', difficulty: 'Easy', marks: 1, options: ['A', 'B', 'C', 'D'], correctAnswer: 'A', lastEdited: 'Just now' },
                { id: Date.now() + 1, text: 'Imported Question 2', type: 'MCQ', topic: 'General', difficulty: 'Medium', marks: 1, options: ['Yes', 'No'], correctAnswer: 'Yes', lastEdited: 'Just now' },
                { id: Date.now() + 2, text: 'Imported Question 3', type: 'Written', topic: 'General', difficulty: 'Hard', marks: 5, options: [], correctAnswer: '', lastEdited: 'Just now' },
            ];

            mockImported.forEach(q => addQuestion(q));

            setIsProcessing(false);
            setStatus('success');

            setTimeout(() => {
                onClose();
                setFile(null);
                setStatus('idle');
            }, 1500);

        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Bulk Import Questions</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-6">
                    {status === 'success' ? (
                        <div className="text-center py-8 animate-fadeIn">
                            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Import Successful!</h3>
                            <p className="text-gray-500">3 questions added to the bank.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-[#8b5cf6] hover:bg-[#8b5cf6]/5 transition-all cursor-pointer group relative">
                                <input
                                    type="file"
                                    accept=".csv, .xlsx"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    disabled={isProcessing}
                                />
                                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <FileSpreadsheet size={24} />
                                </div>
                                {file ? (
                                    <div>
                                        <p className="font-bold text-gray-900">{file.name}</p>
                                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="font-medium text-gray-700">Drop CSV file here</p>
                                        <p className="text-xs text-gray-400 mt-1">or click to browse</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3">
                                <AlertCircle size={20} className="text-blue-600 mt-0.5" />
                                <div className="text-xs text-blue-700">
                                    <p className="font-bold mb-1">CSV Format Required:</p>
                                    <p>Question Text, Type, Topic, Difficulty, Marks, Option A, Option B, Option C, Option D, Correct Answer</p>
                                </div>
                            </div>

                            <button
                                onClick={handleImport}
                                disabled={!file || isProcessing}
                                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${!file || isProcessing
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-[#8b5cf6] text-white hover:bg-[#7c3aed] shadow-lg shadow-purple-500/20'
                                    }`}
                            >
                                {isProcessing ? (
                                    'Importing...'
                                ) : (
                                    <>
                                        <Upload size={20} /> Import Questions
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkImportModal;
