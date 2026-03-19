import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminGlobal } from '../context/AdminGlobalContext';
import { useAdminCourses } from '../context/AdminCourseContext';
import api from '../../utils/axiosConfig';
import {
    ArrowLeft, Save, User, Mail, Phone, BookOpen, Calendar, Lock,
    RefreshCw, Eye, EyeOff, GraduationCap, Briefcase, ChevronDown,
    X, Check, CheckCircle, AlertCircle, Send, Layers,
} from 'lucide-react';

// â”€â”€â”€ Password generators â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Student: [first 4 letters of first name (lowercase)] + [DDMM from enrollment date]
function generateStudentPassword(name, enrollmentDate) {
    const firstName = name.trim().split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
    if (!firstName) return '';
    const prefix = firstName.slice(0, 4).padEnd(4, firstName[firstName.length - 1] || 'x');
    if (!enrollmentDate) return prefix;
    const parts = enrollmentDate.split('-'); // YYYY-MM-DD
    if (parts.length !== 3) return prefix;
    return prefix + parts[2] + parts[1]; // DD + MM â†’ rahu1203
}

// Teacher: [first 4 letters of first name (lowercase)] + [3-digit random number]
function generateTeacherPassword(name, seed) {
    const firstName = name.trim().split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
    if (!firstName) return '';
    const prefix = firstName.slice(0, 4).padEnd(4, firstName[firstName.length - 1] || 'x');
    return prefix + String(seed);
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const UserCreate = () => {
    const navigate    = useNavigate();
    const { id }      = useParams();
    const isEditMode  = !!id;
    const { userActions, users, batches } = useAdminGlobal();
    const { courses } = useAdminCourses();

    // â”€â”€ Core state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [role, setRole]                   = useState('Student');
    const [isLoading, setIsLoading]         = useState(false);
    const [showPassword, setShowPassword]   = useState(true);  // visible by default
    const [apiError, setApiError]           = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [errors, setErrors]               = useState({});
    const [credentialsModal, setCredentialsModal] = useState(null); // { email, password, name }
    const [copied, setCopied] = useState(false);

    // Stable seed for teacher password(survives re-renders; changes only on explicit refresh)
    const teacherSeedRef = useRef(Math.floor(100 + Math.random() * 900));

    // â”€â”€ Dropdown state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
    const [teacherDropdownOpen, setTeacherDropdownOpen] = useState(false);
    const studentDropdownRef = useRef(null);
    const teacherDropdownRef = useRef(null);

    // â”€â”€ Form state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const getDefaultFormData = () => ({
        name:             '',
        email:            '',
        phone:            '',
        status:           'Active',
        password:         '',
        sendWelcomeEmail: true,
        // Student-specific
        studentCourseIds: [],
        batchId:          '',
        enrollmentDate:   new Date().toISOString().split('T')[0],
        // Teacher-specific
        expertise:        '',
        qualification:    '',
        experience:       '',
        department:       '',
        bio:              '',
        teacherCourseIds: [],
    });

    const [formData, setFormData] = useState(getDefaultFormData);

    // â”€â”€ Edit mode: pre-fill form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    useEffect(() => {
        if (isEditMode && users.length > 0) {
            const user = users.find(u => u.id === id);
            if (user) {
                setRole(user.role || 'Student');
                setFormData(prev => ({
                    ...prev,
                    name:           user.name  || '',
                    email:          user.email || '',
                    phone:          user.phone || '',
                    status:         user.status || 'Active',
                    password:       '',
                    sendWelcomeEmail: false,
                    expertise:      user.subject       || '',
                    qualification:  user.qualification || '',
                    experience:     user.experience    || '',
                    department:     user.department    || '',
                    bio:            user.bio           || '',
                    batchId:        user.batchId       || '',
                    enrollmentDate: user.createdAt
                        ? new Date(user.createdAt).toISOString().split('T')[0]
                        : new Date().toISOString().split('T')[0],
                }));
            }
        } else if (!isEditMode) {
            // Generate initial password only for new user
            setFormData(prev => ({ ...prev, password: generateStudentPassword(prev.name, prev.enrollmentDate) }));
        }
    }, [id, users, isEditMode]);

    // â”€â”€ Auto-generate password on name / date / role change (create mode only) â”€
    useEffect(() => {
        if (isEditMode) return;
        const pw = role === 'Student'
            ? generateStudentPassword(formData.name, formData.enrollmentDate)
            : generateTeacherPassword(formData.name, teacherSeedRef.current);
        if (pw !== undefined) {
            setFormData(prev => ({ ...prev, password: pw }));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.name, formData.enrollmentDate, role, isEditMode]);

    // â”€â”€ Close dropdowns on outside click â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (studentDropdownRef.current && !studentDropdownRef.current.contains(e.target))
                setStudentDropdownOpen(false);
            if (teacherDropdownRef.current && !teacherDropdownRef.current.contains(e.target))
                setTeacherDropdownOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    const handleRoleChange = (newRole) => {
        setRole(newRole);
        setErrors({});
        setApiError(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name])  setErrors(prev => ({ ...prev, [name]: null }));
        if (apiError)      setApiError(null);
    };

    // field: 'studentCourseIds' | 'teacherCourseIds'
    const toggleCourseSelection = (course, field) => {
        setFormData(prev => {
            const current = prev[field];
            const exists  = current.includes(course.id);
            return { ...prev, [field]: exists ? current.filter(cid => cid !== course.id) : [...current, course.id] };
        });
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    };

    const handleGeneratePassword = () => {
        if (role === 'Teacher') {
            teacherSeedRef.current = Math.floor(100 + Math.random() * 900);
        }
        const pw = role === 'Student'
            ? generateStudentPassword(formData.name, formData.enrollmentDate)
            : generateTeacherPassword(formData.name, teacherSeedRef.current);
        if (pw) setFormData(prev => ({ ...prev, password: pw }));
    };

    const validate = () => {
        const e = {};
        if (!formData.name.trim())  e.name  = 'Full Name is required';
        if (!formData.email.trim()) {
            e.email = 'Email Address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            e.email = 'Invalid email format';
        }
        if (!formData.phone.trim()) e.phone = 'Phone Number is required';
        if (!isEditMode && !formData.password) e.password = 'Password is required';
        if (role === 'Student' && formData.studentCourseIds.length === 0)
            e.studentCourseIds = 'Select at least one course';
        if (role === 'Teacher' && !formData.expertise.trim())
            e.expertise = 'Expertise Subjects are required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const resetForm = () => {
        teacherSeedRef.current = Math.floor(100 + Math.random() * 900);
        setRole('Student');
        setFormData(getDefaultFormData());
        setErrors({});
        setApiError(null);
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        setApiError(null);

        try {
            if (isEditMode) {
                // â”€â”€ Edit mode â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
                await userActions.updateUser({
                    id,
                    name:          formData.name,
                    email:         formData.email,
                    phone:         formData.phone,
                    status:        formData.status,
                    role,
                    bio:           role === 'Teacher' ? formData.bio          : undefined,
                    subject:       role === 'Teacher' ? formData.expertise    : undefined,
                    qualification: role === 'Teacher' ? formData.qualification : undefined,
                    experience:    role === 'Teacher' ? formData.experience    : undefined,
                    department:    role === 'Teacher' ? formData.department    : undefined,
                });
                navigate('/admin/users');
                return;
            }

            // â”€â”€ Create mode â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            const payload = {
                name:             formData.name.trim(),
                email:            formData.email.trim(),
                phone:            formData.phone.trim(),
                status:           formData.status,
                role,
                password:         formData.password,
                sendWelcomeEmail: formData.sendWelcomeEmail,
            };

            if (role === 'Student') {
                payload.courseIds     = formData.studentCourseIds;
                payload.batchId       = formData.batchId || null;
                payload.enrollmentDate = formData.enrollmentDate;
            } else {
                payload.expertise        = formData.expertise;
                payload.qualification    = formData.qualification;
                payload.experience       = formData.experience;
                payload.department       = formData.department;
                payload.bio              = formData.bio;
                payload.teacherCourseIds = formData.teacherCourseIds;
            }

            const resp = await api.post('/users/admin/create', payload);

            setCredentialsModal({
                email: formData.email.trim(),
                password: resp.data.generatedPassword || formData.password,
                name: formData.name.trim(),
            });
            userActions.refreshUsers();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to create user. Please try again.';
            setApiError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const getCourseTitle    = (cid) => courses.find(c => c.id === cid)?.title || cid;
    const selectedStudentCourses = formData.studentCourseIds.map(getCourseTitle);
    const selectedTeacherCourses = formData.teacherCourseIds.map(getCourseTitle);

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-20">

            {/* â”€â”€ Success Notification â”€â”€ */}
            {/* Credentials Modal */}
            {credentialsModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle size={26} className="text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">User Created Successfully!</h2>
                                <p className="text-sm text-gray-500">Share these credentials with {credentialsModal.name}</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
                            <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</span>
                                <p className="font-mono text-sm font-bold text-gray-800 mt-0.5">{credentialsModal.email}</p>
                            </div>
                            <div>
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password (one-time)</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <p className="font-mono text-sm font-bold text-gray-800 flex-1">{credentialsModal.password}</p>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(credentialsModal.password);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                        }}
                                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 font-semibold transition-colors"
                                    >
                                        {copied ? <><Check size={12} /> Copied!</> : 'Copy'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                            This password will not be shown again. Please copy and share it securely.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setCredentialsModal(null); resetForm(); navigate('/admin/users'); }}
                                className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors"
                            >
                                Done
                            </button>
                            <button
                                onClick={() => { setCredentialsModal(null); resetForm(); }}
                                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                            >
                                Create Another
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {successMessage && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 px-5 py-4 rounded-2xl shadow-sm animate-fadeIn">
                    <CheckCircle size={22} className="text-green-600 shrink-0" />
                    <p className="font-semibold text-sm">{successMessage}</p>
                </div>
            )}

            {/* â”€â”€ API Error Banner â”€â”€ */}
            {apiError && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-2xl shadow-sm">
                    <AlertCircle size={22} className="text-red-600 shrink-0" />
                    <p className="font-semibold text-sm">{apiError}</p>
                    <button onClick={() => setApiError(null)} className="ml-auto text-red-400 hover:text-red-600">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* â”€â”€ Header â”€â”€ */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditMode ? 'Edit User' : 'Create New User'}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {isEditMode ? 'Update user details' : 'Add a new student or teacher to the platform'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>

                {/* â”€â”€ 1. Role Selection â”€â”€ */}
                {!isEditMode && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Select Role</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { value: 'Student', Icon: GraduationCap, label: 'Student' },
                                { value: 'Teacher', Icon: Briefcase,     label: 'Teacher' },
                            ].map(({ value, Icon, label }) => (
                                <label
                                    key={value}
                                    className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 cursor-pointer transition-all
                                        ${role === value
                                            ? 'border-[#8b5cf6] bg-purple-50 text-[#8b5cf6]'
                                            : 'border-gray-100 hover:border-gray-200 text-gray-500'}`}
                                >
                                    <input
                                        type="radio"
                                        name="role"
                                        value={value}
                                        checked={role === value}
                                        onChange={() => handleRoleChange(value)}
                                        className="absolute opacity-0 w-full h-full cursor-pointer"
                                    />
                                    <Icon size={32} className="mb-2" />
                                    <span className="font-bold">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* â”€â”€ 2. Personal Information â”€â”€ */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <User size={20} className="text-[#8b5cf6]" /> Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Full Name */}
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">Full Name *</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Rahul Sharma"
                                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium
                                        ${errors.name ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'}`}
                                />
                            </div>
                            {errors.name && <p className="text-xs text-red-500 font-medium pl-1">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">Email Address *</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="e.g. rahul@example.com"
                                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium
                                        ${errors.email ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'}`}
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-500 font-medium pl-1">{errors.email}</p>}
                        </div>

                        {/* Phone */}
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">Phone Number *</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+91 98765 43210"
                                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium
                                        ${errors.phone ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'}`}
                                />
                            </div>
                            {errors.phone && <p className="text-xs text-red-500 font-medium pl-1">{errors.phone}</p>}
                        </div>

                        {/* Status */}
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium h-[46px]"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Suspended">Suspended</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* â”€â”€ 3a. Student: Academic Details â”€â”€ */}
                {role === 'Student' && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fadeIn">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <BookOpen size={20} className="text-[#8b5cf6]" /> Academic Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Assign Courses â€“ multi-select */}
                            <div className="col-span-2 space-y-1" ref={studentDropdownRef}>
                                <label className="text-sm font-bold text-gray-700">Assign Courses *</label>
                                <div className="relative">
                                    <div
                                        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl cursor-pointer flex items-center justify-between
                                            ${errors.studentCourseIds ? 'border-red-300' : 'border-gray-200'}`}
                                        onClick={() => setStudentDropdownOpen(o => !o)}
                                    >
                                        <span className={formData.studentCourseIds.length === 0 ? 'text-gray-400' : 'text-gray-900 font-medium'}>
                                            {formData.studentCourseIds.length === 0
                                                ? 'Select courses...'
                                                : `${formData.studentCourseIds.length} course(s) selected`}
                                        </span>
                                        <ChevronDown size={18} className="text-gray-500" />
                                    </div>

                                    {/* Selected chips */}
                                    {formData.studentCourseIds.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {formData.studentCourseIds.map(cid => (
                                                <div key={cid} className="flex items-center gap-1 bg-[#8b5cf6]/10 text-[#8b5cf6] px-2 py-1 rounded-lg text-xs font-bold">
                                                    {getCourseTitle(cid)}
                                                    <button type="button"
                                                        onClick={() => toggleCourseSelection({ id: cid }, 'studentCourseIds')}
                                                        className="hover:text-purple-800">
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Dropdown */}
                                    {studentDropdownOpen && (
                                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto p-2">
                                            {courses.length === 0
                                                ? <p className="text-sm text-gray-400 p-3 text-center">No courses available</p>
                                                : courses.map(course => (
                                                    <div
                                                        key={course.id}
                                                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                                                        onClick={() => toggleCourseSelection(course, 'studentCourseIds')}
                                                    >
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                                                            ${formData.studentCourseIds.includes(course.id) ? 'bg-[#8b5cf6] border-[#8b5cf6]' : 'border-gray-300'}`}>
                                                            {formData.studentCourseIds.includes(course.id) && <Check size={12} className="text-white" />}
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-700">{course.title}</span>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    )}
                                </div>
                                {errors.studentCourseIds && <p className="text-xs text-red-500 font-medium pl-1">{errors.studentCourseIds}</p>}
                            </div>

                            {/* Batch / Group */}
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">Batch / Group</label>
                                <div className="relative">
                                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <select
                                        name="batchId"
                                        value={formData.batchId}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium appearance-none h-[46px]"
                                    >
                                        <option value="">Leave unassigned (assign later)</option>
                                        {batches.map(b => (
                                            <option key={b.id} value={b.id}>{b.batchName}</option>
                                        ))}
                                    </select>
                                </div>
                                <p className="text-xs text-gray-400 pl-1">You can assign a batch later from Batch Management</p>
                            </div>

                            {/* Enrollment Date */}
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">Enrollment Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="date"
                                        name="enrollmentDate"
                                        value={formData.enrollmentDate}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* â”€â”€ 3b. Teacher: Professional Details â”€â”€ */}
                {role === 'Teacher' && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fadeIn">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Briefcase size={20} className="text-[#8b5cf6]" /> Professional Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Expertise Subjects */}
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-sm font-bold text-gray-700">Expertise Subjects *</label>
                                <input
                                    type="text"
                                    name="expertise"
                                    value={formData.expertise}
                                    onChange={handleChange}
                                    placeholder="e.g. Physics, Mathematics, Advanced Calculus"
                                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium
                                        ${errors.expertise ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'}`}
                                />
                                <p className="text-xs text-gray-400 pl-1">Separate subjects with commas</p>
                                {errors.expertise && <p className="text-xs text-red-500 font-medium pl-1">{errors.expertise}</p>}
                            </div>

                            {/* Qualification */}
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">Qualification</label>
                                <input
                                    type="text"
                                    name="qualification"
                                    value={formData.qualification}
                                    onChange={handleChange}
                                    placeholder="e.g. M.Sc. Physics, PhD Mathematics"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium"
                                />
                            </div>

                            {/* Experience */}
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">Experience</label>
                                <input
                                    type="text"
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleChange}
                                    placeholder="e.g. 5 years, 10+ years"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium"
                                />
                            </div>

                            {/* Department */}
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-sm font-bold text-gray-700">Department</label>
                                <input
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    placeholder="e.g. Computer Science, Mathematics"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium"
                                />
                            </div>

                            {/* Assign Courses to Teach â€“ multi-select */}
                            <div className="md:col-span-2 space-y-1" ref={teacherDropdownRef}>
                                <label className="text-sm font-bold text-gray-700">Assign Courses to Teach</label>
                                <div className="relative">
                                    <div
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer flex items-center justify-between"
                                        onClick={() => setTeacherDropdownOpen(o => !o)}
                                    >
                                        <span className={formData.teacherCourseIds.length === 0 ? 'text-gray-400' : 'text-gray-900 font-medium'}>
                                            {formData.teacherCourseIds.length === 0
                                                ? 'Select courses to teach...'
                                                : `${formData.teacherCourseIds.length} course(s) selected`}
                                        </span>
                                        <ChevronDown size={18} className="text-gray-500" />
                                    </div>

                                    {/* Selected chips */}
                                    {formData.teacherCourseIds.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {formData.teacherCourseIds.map(cid => (
                                                <div key={cid} className="flex items-center gap-1 bg-[#8b5cf6]/10 text-[#8b5cf6] px-2 py-1 rounded-lg text-xs font-bold">
                                                    {getCourseTitle(cid)}
                                                    <button type="button"
                                                        onClick={() => toggleCourseSelection({ id: cid }, 'teacherCourseIds')}
                                                        className="hover:text-purple-800">
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Dropdown */}
                                    {teacherDropdownOpen && (
                                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto p-2">
                                            {courses.length === 0
                                                ? <p className="text-sm text-gray-400 p-3 text-center">No courses available</p>
                                                : courses.map(course => (
                                                    <div
                                                        key={course.id}
                                                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                                                        onClick={() => toggleCourseSelection(course, 'teacherCourseIds')}
                                                    >
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                                                            ${formData.teacherCourseIds.includes(course.id) ? 'bg-[#8b5cf6] border-[#8b5cf6]' : 'border-gray-300'}`}>
                                                            {formData.teacherCourseIds.includes(course.id) && <Check size={12} className="text-white" />}
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-700">{course.title}</span>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-sm font-bold text-gray-700">Bio / Description</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Short professional biography..."
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium resize-none"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* â”€â”€ 4. Account Security â”€â”€ */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Lock size={20} className="text-[#8b5cf6]" /> Account Security
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Password */}
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                Password {isEditMode ? <span className="text-xs text-gray-400 font-normal">(Leave blank to keep current)</span> : '*'}
                            </label>

                            {/* Password hint */}
                            {!isEditMode && (
                                <div className="mb-1 px-3 py-2 bg-purple-50 border border-purple-100 rounded-xl text-xs text-purple-700 font-medium">
                                    {role === 'Student'
                                        ? 'Auto-generated: first 4 letters of name + DDMM of enrollment date'
                                        : 'Auto-generated: first 4 letters of name + 3-digit number'}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder={isEditMode ? 'Leave blank to keep current password' : ''}
                                        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-mono tracking-wider
                                            ${errors.password ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        title={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {!isEditMode && (
                                    <button
                                        type="button"
                                        onClick={handleGeneratePassword}
                                        className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-[#8b5cf6]/10 hover:text-[#8b5cf6] transition-colors"
                                        title="Re-generate password"
                                    >
                                        <RefreshCw size={20} />
                                    </button>
                                )}
                            </div>
                            {errors.password && <p className="text-xs text-red-500 font-medium pl-1">{errors.password}</p>}
                        </div>

                        {/* Send Welcome Email */}
                        {!isEditMode && (
                            <div className="flex items-start gap-3 pt-7">
                                <input
                                    type="checkbox"
                                    id="sendWelcomeEmail"
                                    name="sendWelcomeEmail"
                                    checked={formData.sendWelcomeEmail}
                                    onChange={handleChange}
                                    className="mt-0.5 w-5 h-5 text-[#8b5cf6] rounded focus:ring-[#8b5cf6] border-gray-300 cursor-pointer"
                                />
                                <label htmlFor="sendWelcomeEmail" className="cursor-pointer">
                                    <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                                        <Send size={14} className="text-[#8b5cf6]" />
                                        Send welcome email with login credentials
                                    </span>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        An email containing the login URL, email and generated password will be sent to the user.
                                    </p>
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                {/* â”€â”€ Action Buttons â”€â”€ */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/users')}
                        className="px-6 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
                        {isLoading ? 'Creating...' : (isEditMode ? 'Update User' : 'Create User')}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default UserCreate;
