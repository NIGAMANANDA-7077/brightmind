import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminGlobal } from '../context/AdminGlobalContext';
import { useAdminCourses } from '../context/AdminCourseContext';
import { ArrowLeft, Save, User, Mail, Phone, BookOpen, Layers, Calendar, Lock, RefreshCw, Eye, EyeOff, Upload, GraduationCap, Briefcase, ChevronDown, X, Check } from 'lucide-react';

const UserCreate = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const { userActions, users } = useAdminGlobal();
    const { courses } = useAdminCourses();

    // Core State
    const [role, setRole] = useState('Student');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Dropdown States
    const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
    const [teacherDropdownOpen, setTeacherDropdownOpen] = useState(false);
    const studentDropdownRef = useRef(null);
    const teacherDropdownRef = useRef(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        status: 'Active',

        // Account
        password: '', // Initialize empty, will generate for new users or keep empty for edit
        sendWelcomeEmail: true,

        // Student Specific
        studentCourses: [],
        batch: 'Batch A',
        enrollmentDate: new Date().toISOString().split('T')[0],

        // Teacher Specific
        expertise: '',
        bio: '',
        teacherCourses: []
    });

    useEffect(() => {
        if (isEditMode) {
            const user = users.find(u => u.id === parseInt(id) || u.id === id);
            if (user) {
                setRole(user.role);
                setFormData({
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    status: user.status,
                    password: '', // Don't show password
                    sendWelcomeEmail: false,
                    studentCourses: user.role === 'Student' ? user.courses : [],
                    batch: user.batch || 'Batch A',
                    enrollmentDate: user.joinedDate,
                    expertise: user.expertise ? user.expertise.join(', ') : '',
                    bio: user.bio || '',
                    teacherCourses: user.role === 'Teacher' ? user.courses : []
                });
            }
        } else {
            // Generate password only for new users
            setFormData(prev => ({ ...prev, password: generateStrongPassword() }));
        }
    }, [id, users, isEditMode]);

    const [errors, setErrors] = useState({});

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target)) {
                setStudentDropdownOpen(false);
            }
            if (teacherDropdownRef.current && !teacherDropdownRef.current.contains(event.target)) {
                setTeacherDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Helper: Generate Password
    function generateStrongPassword() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        let password = "";
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    const handleGeneratePassword = () => {
        setFormData(prev => ({ ...prev, password: generateStrongPassword() }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when field is edited
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const toggleCourseSelection = (courseTitle, field) => {
        setFormData(prev => {
            const currentSelected = prev[field];
            const isSelected = currentSelected.includes(courseTitle);

            let newSelected;
            if (isSelected) {
                newSelected = currentSelected.filter(t => t !== courseTitle);
            } else {
                newSelected = [...currentSelected, courseTitle];
            }

            return { ...prev, [field]: newSelected };
        });

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = "Full Name is required";
        if (!formData.email) newErrors.email = "Email is required";
        if (!formData.phone) newErrors.phone = "Phone is required";
        if (!isEditMode && !formData.password) newErrors.password = "Password is required";

        if (role === 'Student' && formData.studentCourses.length === 0) {
            newErrors.studentCourses = "Select at least one course";
        }
        if (role === 'Teacher' && !formData.expertise) {
            newErrors.expertise = "Expertise subjects are required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const userData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            status: formData.status,
            role: role,
            joinedDate: new Date().toISOString().split('T')[0],
            courses: role === 'Student' ? formData.studentCourses : formData.teacherCourses,
            // Additional fields for Teacher
            expertise: role === 'Teacher' ? formData.expertise.split(',').map(s => s.trim()) : undefined,
            bio: role === 'Teacher' ? formData.bio : undefined,
            // Additional fields for Student
            batch: role === 'Student' ? formData.batch : undefined,
        };

        if (isEditMode) {
            const userToUpdate = {
                ...userData,
                id: parseInt(id) || id, // Preserve ID
                // Keep existing password if not changed (handled in mock for now, or assume backend handles it)
                // In this mock context, we need to pass the ID to update
            };
            userActions.updateUser(userToUpdate);
        } else {
            userActions.addUser(userData);
        }
        navigate('/admin/users');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit User' : 'Create New User'}</h1>
                    <p className="text-gray-500">{isEditMode ? 'Update user details' : 'Add a new student or teacher to the platform'}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* 1. Role Selection */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Select Role</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <label className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 cursor-pointer transition-all
                            ${role === 'Student' ? 'border-[#8b5cf6] bg-purple-50 text-[#8b5cf6]' : 'border-gray-100 hover:border-gray-200 text-gray-500'}
                        `}>
                            <input
                                type="radio"
                                name="role"
                                value="Student"
                                checked={role === 'Student'}
                                onChange={(e) => setRole(e.target.value)}
                                className="absolute opacity-0 w-full h-full cursor-pointer"
                            />
                            <GraduationCap size={32} className="mb-2" />
                            <span className="font-bold">Student</span>
                        </label>

                        <label className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 cursor-pointer transition-all
                            ${role === 'Teacher' ? 'border-[#8b5cf6] bg-purple-50 text-[#8b5cf6]' : 'border-gray-100 hover:border-gray-200 text-gray-500'}
                        `}>
                            <input
                                type="radio"
                                name="role"
                                value="Teacher"
                                checked={role === 'Teacher'}
                                onChange={(e) => setRole(e.target.value)}
                                className="absolute opacity-0 w-full h-full cursor-pointer"
                            />
                            <Briefcase size={32} className="mb-2" />
                            <span className="font-bold">Teacher</span>
                        </label>
                    </div>
                </div>

                {/* 2. Personal Information (Common) */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <User size={20} className="text-[#8b5cf6]" /> Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">Full Name *</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. John Doe"
                                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium
                                        ${errors.name ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'}
                                    `}
                                />
                            </div>
                            {errors.name && <p className="text-xs text-red-500 font-medium pl-1">{errors.name}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">Email Address *</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="e.g. john@example.com"
                                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium
                                        ${errors.email ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'}
                                    `}
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-500 font-medium pl-1">{errors.email}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">Phone Number *</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+1 234 567 8900"
                                    className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium
                                        ${errors.phone ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'}
                                    `}
                                />
                            </div>
                            {errors.phone && <p className="text-xs text-red-500 font-medium pl-1">{errors.phone}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium h-[46px]"
                            >
                                <option value="Active">Active</option>
                                <option value="Suspended">Suspended</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 3. Role Specific Fields */}
                {role === 'Student' && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fadeIn">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <BookOpen size={20} className="text-[#8b5cf6]" /> Academic Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Custom Multi-Select for Student */}
                            <div className="col-span-2 space-y-1" ref={studentDropdownRef}>
                                <label className="text-sm font-bold text-gray-700">Assign Courses *</label>
                                <div className="relative">
                                    <div
                                        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none cursor-pointer flex items-center justify-between
                                            ${errors.studentCourses ? 'border-red-300' : 'border-gray-200'}
                                        `}
                                        onClick={() => setStudentDropdownOpen(!studentDropdownOpen)}
                                    >
                                        <span className={`${formData.studentCourses.length === 0 ? 'text-gray-400' : 'text-gray-900 font-medium'} `}>
                                            {formData.studentCourses.length === 0
                                                ? 'Select courses...'
                                                : `${formData.studentCourses.length} course(s) selected`}
                                        </span>
                                        <ChevronDown size={18} className="text-gray-500" />
                                    </div>

                                    {/* Selected Chips */}
                                    {formData.studentCourses.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {formData.studentCourses.map(course => (
                                                <div key={course} className="flex items-center gap-1 bg-[#8b5cf6]/10 text-[#8b5cf6] px-2 py-1 rounded-lg text-xs font-bold">
                                                    {course}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); toggleCourseSelection(course, 'studentCourses'); }}
                                                        className="hover:text-purple-800"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Dropdown Menu */}
                                    {studentDropdownOpen && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto p-2">
                                            {courses.map(course => (
                                                <div
                                                    key={course.id}
                                                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                                                    onClick={() => toggleCourseSelection(course.title, 'studentCourses')}
                                                >
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                                                        ${formData.studentCourses.includes(course.title) ? 'bg-[#8b5cf6] border-[#8b5cf6]' : 'border-gray-300'}
                                                    `}>
                                                        {formData.studentCourses.includes(course.title) && <Check size={12} className="text-white" />}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">{course.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {errors.studentCourses && <p className="text-xs text-red-500 font-medium pl-1">{errors.studentCourses}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700">Batch / Group</label>
                                <select
                                    name="batch"
                                    value={formData.batch}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium"
                                >
                                    <option value="Batch A">Batch A (Morning)</option>
                                    <option value="Batch B">Batch B (Afternoon)</option>
                                    <option value="Batch C">Batch C (Evening)</option>
                                </select>
                            </div>

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

                {role === 'Teacher' && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fadeIn">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Briefcase size={20} className="text-[#8b5cf6]" /> Professional Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2 space-y-1">
                                <label className="text-sm font-bold text-gray-700">Expertise Subjects *</label>
                                <input
                                    type="text"
                                    name="expertise"
                                    value={formData.expertise}
                                    onChange={handleChange}
                                    placeholder="e.g. Physics, Mathematics, Advanced Calculus"
                                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium
                                        ${errors.expertise ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'}
                                    `}
                                />
                                <p className="text-xs text-gray-400 mt-1">Separate subjects with commas</p>
                                {errors.expertise && <p className="text-xs text-red-500 font-medium pl-1">{errors.expertise}</p>}
                            </div>

                            {/* Custom Multi-Select for Teacher */}
                            <div className="col-span-2 space-y-1" ref={teacherDropdownRef}>
                                <label className="text-sm font-bold text-gray-700">Assign Courses to Teach</label>
                                <div className="relative">
                                    <div
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none cursor-pointer flex items-center justify-between"
                                        onClick={() => setTeacherDropdownOpen(!teacherDropdownOpen)}
                                    >
                                        <span className={`${formData.teacherCourses.length === 0 ? 'text-gray-400' : 'text-gray-900 font-medium'} `}>
                                            {formData.teacherCourses.length === 0
                                                ? 'Select courses to teach...'
                                                : `${formData.teacherCourses.length} course(s) selected`}
                                        </span>
                                        <ChevronDown size={18} className="text-gray-500" />
                                    </div>

                                    {/* Selected Chips */}
                                    {formData.teacherCourses.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {formData.teacherCourses.map(course => (
                                                <div key={course} className="flex items-center gap-1 bg-[#8b5cf6]/10 text-[#8b5cf6] px-2 py-1 rounded-lg text-xs font-bold">
                                                    {course}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); toggleCourseSelection(course, 'teacherCourses'); }}
                                                        className="hover:text-purple-800"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Dropdown Menu */}
                                    {teacherDropdownOpen && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto p-2">
                                            {courses.map(course => (
                                                <div
                                                    key={course.id}
                                                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                                                    onClick={() => toggleCourseSelection(course.title, 'teacherCourses')}
                                                >
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors
                                                        ${formData.teacherCourses.includes(course.title) ? 'bg-[#8b5cf6] border-[#8b5cf6]' : 'border-gray-300'}
                                                    `}>
                                                        {formData.teacherCourses.includes(course.title) && <Check size={12} className="text-white" />}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">{course.title}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-span-2 space-y-1">
                                <label className="text-sm font-bold text-gray-700">Bio / Description</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Short professional biography..."
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium"
                                ></textarea>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. Account Settings */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Lock size={20} className="text-[#8b5cf6]" /> Account Security
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-gray-700">Password {isEditMode ? '(Leave blank to keep current)' : '*'}</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/20 transition-all font-medium
                                            ${errors.password ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'}
                                        `}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleGeneratePassword}
                                    className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                                    title="Generate Password"
                                >
                                    <RefreshCw size={20} />
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-500 font-medium pl-1">{errors.password}</p>}
                        </div>

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                name="sendWelcomeEmail"
                                checked={formData.sendWelcomeEmail}
                                onChange={handleChange}
                                className="w-5 h-5 text-[#8b5cf6] rounded focus:ring-[#8b5cf6] border-gray-300"
                                id="welcome-email"
                            />
                            <label htmlFor="welcome-email" className="text-sm font-medium text-gray-700 cursor-pointer">
                                Send welcome email with login credentials
                            </label>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4">
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
                        {isEditMode ? 'Update User' : 'Create User'}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default UserCreate;
