import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ChevronLeft, Save, Upload, Image as ImageIcon, X, Loader2, BookOpen } from 'lucide-react';
import { useAdminCourses } from '../context/AdminCourseContext';
import api from '../../utils/axiosConfig';

const CourseCreate = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { addCourse, updateCourse, getCourse } = useAdminCourses();
    const isEditMode = !!id;
    const fileInputRef = useRef(null);

    const [isLoading, setIsLoading] = useState(false);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [uploadingThumb, setUploadingThumb] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [errors, setErrors] = useState({});

    const [form, setForm] = useState({
        title: '',
        description: '',
        thumbnail: '',
        price: '',
        teacherId: '',
        subject: 'General'
    });

    // Fetch teachers
    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const res = await api.get('/users');
                setTeachers(res.data.filter(u => u.role === 'Teacher'));
            } catch (err) {
                console.error("Failed to fetch teachers", err);
            }
        };
        fetchTeachers();
    }, []);

    // Load existing course in edit mode
    useEffect(() => {
        if (isEditMode) {
            const existing = getCourse(id);
            if (existing) {
                setForm({
                    title: existing.title || '',
                    description: existing.description || existing.subtitle || '',
                    thumbnail: existing.thumbnail || '',
                    price: existing.price || '',
                    teacherId: existing.teacherId || '',
                    subject: existing.subject || existing.category || 'General'
                });
                if (existing.thumbnail) setThumbnailPreview(existing.thumbnail);
            }
        }
    }, [id, isEditMode, getCourse]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleThumbnailSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onload = (ev) => setThumbnailPreview(ev.target.result);
        reader.readAsDataURL(file);
        setThumbnailFile(file);

        // Upload immediately
        setUploadingThumb(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const url = res.data?.url || res.data?.fileUrl || res.data?.path;
            if (url) {
                setForm(prev => ({ ...prev, thumbnail: url }));
            }
        } catch (err) {
            console.error('Thumbnail upload failed', err);
        } finally {
            setUploadingThumb(false);
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!form.title.trim()) newErrors.title = 'Course title is required';
        if (!form.description.trim()) newErrors.description = 'Short description is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async (status = 'Draft') => {
        if (!validate()) return;
        setIsLoading(true);
        try {
            const payload = {
                ...form,
                status,
                category: form.subject,
                subtitle: form.description,
                price: form.price ? parseFloat(form.price) : 0
            };

            if (isEditMode) {
                await updateCourse(id, payload);
            } else {
                await addCourse(payload);
            }
            navigate('/admin/courses');
        } catch (err) {
            console.error("Failed to save course:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto pb-20 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link to="/admin/courses" className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
                    <ChevronLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditMode ? 'Edit Course' : 'Create New Course'}
                    </h1>
                    <p className="text-gray-500 text-sm">Admin creates course and assigns a teacher</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
                {/* Course Title */}
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                        Course Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="e.g. Advanced React Development"
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/10 transition-all ${errors.title ? 'border-red-400' : 'border-gray-200'}`}
                    />
                    {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                </div>

                {/* Short Description */}
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                        Short Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Brief summary of what students will learn..."
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/10 transition-all resize-none ${errors.description ? 'border-red-400' : 'border-gray-200'}`}
                    />
                    {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                </div>

                {/* Thumbnail */}
                <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Course Thumbnail</label>
                    {thumbnailPreview ? (
                        <div className="relative rounded-xl overflow-hidden border border-gray-200">
                            <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-48 object-cover" />
                            <button
                                onClick={() => { setThumbnailPreview(null); setThumbnailFile(null); setForm(p => ({ ...p, thumbnail: '' })); }}
                                className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80"
                            >
                                <X size={14} />
                            </button>
                            {uploadingThumb && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <Loader2 size={24} className="text-white animate-spin" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-200 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:border-[#8b5cf6] hover:bg-[#8b5cf6]/5 transition-all cursor-pointer group"
                        >
                            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-[#8b5cf6] mb-3 group-hover:scale-110 transition-transform">
                                <ImageIcon size={24} />
                            </div>
                            <p className="text-sm font-medium text-gray-700">Click to upload thumbnail</p>
                            <p className="text-xs text-gray-400 mt-1">Recommended: 1280×720px (JPG, PNG, WEBP)</p>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleThumbnailSelect}
                    />
                </div>

                {/* Price & Assign Teacher - 2 columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Price (₹)</label>
                        <input
                            type="number"
                            name="price"
                            value={form.price}
                            onChange={handleChange}
                            placeholder="0 for free"
                            min="0"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/10 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Assign Teacher</label>
                        <select
                            name="teacherId"
                            value={form.teacherId}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/10 transition-all"
                        >
                            <option value="">-- No Teacher Yet --</option>
                            {teachers.map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                            ))}
                        </select>
                        <p className="text-[11px] text-gray-400 mt-1">Teacher will be notified when assigned</p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
                <button
                    onClick={() => handleSave('Draft')}
                    disabled={isLoading || uploadingThumb}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save as Draft
                </button>
                <button
                    onClick={() => handleSave('Active')}
                    disabled={isLoading || uploadingThumb}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#8b5cf6] text-white font-bold rounded-xl hover:bg-[#7c3aed] transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50"
                >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <BookOpen size={18} />}
                    Publish Course
                </button>
            </div>
        </div>
    );
};

export default CourseCreate;
