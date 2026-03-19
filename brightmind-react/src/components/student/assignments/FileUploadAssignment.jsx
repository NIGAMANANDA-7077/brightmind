import React, { useState } from 'react';
import { UploadCloud, File, X, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import api from '../../../utils/axiosConfig';

// Allowed file types (all except pure video)
const ACCEPTED = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.txt', '.rtf', '.csv',
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
    '.zip', '.rar', '.7z'
].join(',');

const getFileIcon = (name) => {
    const ext = name?.split('.').pop()?.toLowerCase();
    if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return '🖼️';
    if (['pdf'].includes(ext)) return '📄';
    if (['zip','rar','7z'].includes(ext)) return '🗜️';
    if (['doc','docx'].includes(ext)) return '📝';
    if (['xls','xlsx'].includes(ext)) return '📊';
    if (['ppt','pptx'].includes(ext)) return '📑';
    return '📎';
};

const FileUploadAssignment = ({ assignment, onSubmit }) => {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
    };
    const handleFileChange = (e) => {
        if (e.target.files?.[0]) { setFile(e.target.files[0]); setError(''); }
    };

    const handleSubmit = async () => {
        if (!file) return;
        setUploading(true);
        setError('');
        try {
            // 1. Upload file to server
            const formData = new FormData();
            formData.append('file', file);
            const uploadRes = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const fileUrl = uploadRes.data.url;

            // 2. Submit assignment with real URL
            await onSubmit(fileUrl);
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const sub = assignment.studentSubmission;
    if (assignment.status === 'Submitted' || assignment.status === 'Late' || assignment.status === 'Graded') {
        const fileUrl = sub?.fileUrl;
        const fileName = fileUrl ? decodeURIComponent(fileUrl.split('/').pop().replace(/^\w+-\d+-\d+\./, '')) : null;
        return (
            <div className="bg-green-50 p-8 rounded-3xl border border-green-100 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-green-900 mb-2">
                    {assignment.status === 'Graded' ? 'Assignment Graded' : 'Submitted Successfully'}
                </h3>
                {fileUrl ? (
                    <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-[#8b5cf6] font-bold hover:underline mb-4 text-sm"
                    >
                        {getFileIcon(fileUrl)} View Your Submission <ExternalLink size={14} />
                    </a>
                ) : null}
                {sub?.submittedAt && (
                    <p className="text-green-600 text-sm mt-2">
                        Submitted on {new Date(sub.submittedAt).toLocaleString()}
                    </p>
                )}
                {assignment.status === 'Graded' && assignment.grade != null && (
                    <div className="mt-4 p-3 bg-white rounded-xl border border-green-200 inline-block">
                        <p className="text-green-700 font-bold text-lg">{assignment.grade} / {assignment.totalMarks}</p>
                        {assignment.feedback && (
                            <p className="text-green-600 text-sm mt-1 italic">"{assignment.feedback}"</p>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div
                className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all ${isDragging ? 'border-[#8b5cf6] bg-[#8b5cf6]/5' : 'border-gray-200 hover:border-[#8b5cf6]/50'}`}
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
                        <p className="text-gray-500 mb-2">or click to browse from your computer</p>
                        <p className="text-xs text-gray-400 mb-6">PDF, Word, Excel, PowerPoint, Images, ZIP and more • Max 50MB</p>
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            accept={ACCEPTED}
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
                        <div className="text-5xl mb-4">{getFileIcon(file.name)}</div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{file.name}</h3>
                        <p className="text-gray-500 text-sm mb-4">
                            {file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
                        </p>
                        <button
                            onClick={() => setFile(null)}
                            className="text-red-500 font-bold flex items-center gap-1 mx-auto hover:bg-red-50 px-3 py-1 rounded-lg transition-colors text-sm"
                        >
                            <X size={14} /> Remove File
                        </button>
                    </div>
                )}
            </div>

            {error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 px-4 rounded-xl">{error}</p>}

            <div className="flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={!file || uploading}
                    className="px-8 py-4 bg-[#8b5cf6] text-white rounded-xl font-bold hover:bg-[#7c3aed] transition-all shadow-lg shadow-purple-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {uploading ? <><Loader2 size={18} className="animate-spin" /> Uploading...</> : 'Submit Assignment'}
                </button>
            </div>
        </div>
    );
};

export default FileUploadAssignment;
