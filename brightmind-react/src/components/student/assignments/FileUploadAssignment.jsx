import React, { useState } from 'react';
import { UploadCloud, File, X, CheckCircle } from 'lucide-react';

const FileUploadAssignment = ({ assignment, onSubmit }) => {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = () => {
        if (file) {
            onSubmit(file.name);
        }
    };

    if (assignment.status === 'Submitted' || assignment.status === 'Graded') {
        return (
            <div className="bg-green-50 p-8 rounded-3xl border border-green-100 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-green-900 mb-2">Submitted Successfully</h3>
                <p className="text-green-700 mb-6">You submitted <span className="font-bold">{assignment.studentSubmission?.fileUrl || 'your file'}</span> on {new Date(assignment.submissionDate).toLocaleDateString()}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div
                className={`border-3 border-dashed rounded-3xl p-12 text-center transition-all ${isDragging ? 'border-[#8b5cf6] bg-[#8b5cf6]/5' : 'border-gray-200 hover:border-[#8b5cf6]/50'
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {!file ? (
                    <>
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                            <UploadCloud size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Drag & Drop your file here</h3>
                        <p className="text-gray-500 mb-6">or click to browse from your computer</p>
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <label
                            htmlFor="file-upload"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 cursor-pointer transition-colors shadow-sm"
                        >
                            Browse Files
                        </label>
                    </>
                ) : (
                    <div className="animate-fade-in">
                        <div className="w-20 h-20 bg-[#8b5cf6]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#8b5cf6]">
                            <File size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{file.name}</h3>
                        <p className="text-gray-500 mb-6">{(file.size / 1024).toFixed(2)} KB</p>
                        <button
                            onClick={() => setFile(null)}
                            className="text-red-500 font-bold flex items-center gap-1 mx-auto hover:bg-red-50 px-3 py-1 rounded-lg transition-colors"
                        >
                            <X size={16} /> Remove File
                        </button>
                    </div>
                )}
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={!file}
                    className="px-8 py-4 bg-[#8b5cf6] text-white rounded-xl font-bold hover:bg-[#7c3aed] transition-all shadow-lg shadow-purple-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Submit Assignment
                </button>
            </div>
        </div>
    );
};

export default FileUploadAssignment;
