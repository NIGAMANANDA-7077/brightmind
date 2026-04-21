import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, GraduationCap, School, Eye, EyeOff } from 'lucide-react';
import { useUser } from '../context/UserContext';

const Login = () => {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState('Student');
    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [greeting, setGreeting] = useState('Welcome Back');

    useEffect(() => {
        const greetings = [
            'Welcome',
            'Hello there!',
            'Glad to see you!',
            'Ready to learn?',
            'Welcome to BrightMind',
            'Let\'s get started!'
        ];
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        setGreeting(randomGreeting);
    }, []);

    const { login, studentLogin } = useUser();

    const roles = [
        { id: 'Student', icon: User, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', activeBorder: 'border-blue-500' },
        { id: 'Teacher', icon: GraduationCap, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200', activeBorder: 'border-green-500' },
        { id: 'Admin', icon: School, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200', activeBorder: 'border-purple-500' },
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrors({});

        // Send email, password, AND the selected role — enforced strictly by the backend
        const result = await login(formData.identifier, formData.password, selectedRole);

        if (result.success) {
            switch (result.role) {
                case 'Student':
                    navigate('/student/dashboard');
                    break;
                case 'Teacher':
                    navigate('/teacher-dashboard');
                    break;
                case 'Admin':
                    navigate('/admin/dashboard');
                    break;
                case 'SuperAdmin':
                    navigate('/admin/admin-management');
                    break;
                default:
                    navigate('/');
            }
        } else {
            // Show a clear role-mismatch message when the backend rejects due to wrong role
            const isRoleMismatch = result.message === 'Invalid role selected for this account';
            setErrors({
                auth: isRoleMismatch
                    ? `You are trying to log in as the wrong role. Please select "${selectedRole}" only if your account has that role.`
                    : result.message || 'Invalid credentials',
                suspended: result.suspended
            });
        }
    };

    const handleDemoLogin = () => {
        let identifier = '';
        if (selectedRole === 'Admin')   identifier = 'admin@brightmind.com';
        if (selectedRole === 'Teacher') identifier = 'ananay@brightmind.com';
        if (selectedRole === 'Student') identifier = 'priya@student.com';

        setFormData({
            identifier,
            password: 'password123'
        });
        setErrors({});
    };

    return (
        <div className="min-h-screen pt-24 pb-12 theme-surface flex items-center justify-center px-4 transition-colors duration-300">
            <div className="theme-card rounded-[2rem] shadow-xl max-w-lg w-full overflow-hidden">

                {/* Header */}
                <div className="text-center pt-10 pb-6 px-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{greeting}</h1>
                    <p className="text-gray-500 dark:text-gray-400">Please select your role to login</p>
                </div>

                {/* Role Selector */}
                <div className="px-8 mb-8">
                    <div className="grid grid-cols-3 gap-3">
                        {roles.map((role) => {
                            const Icon = role.icon;
                            const isSelected = selectedRole === role.id;

                            return (
                                <button
                                    key={role.id}
                                    onClick={() => {
                                        setSelectedRole(role.id);
                                        setErrors({});
                                    }}
                                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${isSelected
                                        ? `${role.activeBorder} bg-[color:var(--bg-primary)]`
                                        : 'border-[color:var(--border-color)] hover:border-[#8b5cf6] bg-[color:var(--card-bg)]'
                                        }`}
                                >
                                    <div className={`p-2 rounded-full mb-2 ${isSelected ? 'bg-[color:var(--card-bg)]' : role.bg}`}>
                                        <Icon className={`w-5 h-5 ${role.color}`} />
                                    </div>
                                    <span className={`text-sm font-bold ${isSelected ? 'text-[color:var(--text-primary)]' : 'text-[color:var(--text-secondary)]'}`}>
                                        {role.id}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Login Form */}
                <div className="bg-[color:var(--bg-secondary)] p-8 md:p-10 border-t border-[color:var(--border-color)] transition-colors duration-300">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-[color:var(--text-primary)] ml-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="identifier"
                                value={formData.identifier}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                className={`w-full px-5 py-4 rounded-xl input-surface border outline-none transition-all placeholder:text-gray-400 font-medium ${
                                    errors.auth
                                        ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                                        : 'border-[color:var(--border-color)] focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/10'
                                    }`}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-bold text-[color:var(--text-primary)]">Password</label>
                                <Link to="/forgot-password" className="text-sm font-semibold text-[#8b5cf6] hover:text-[#7c3aed]">Forgot Password?</Link>
                            </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        className={`w-full px-5 py-4 rounded-xl input-surface border outline-none transition-all placeholder:text-gray-400 font-medium pr-12 ${errors.password
                                            ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                                            : 'border-[color:var(--border-color)] focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/10'
                                            }`}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            {errors.password && (
                                <p className="text-red-500 text-sm ml-1 font-medium animate-pulse">
                                    {errors.password}
                                </p>
                            )}
                            {errors.auth && (
                                <p className={`text-sm ml-1 font-bold animate-pulse text-center mt-2 ${errors.suspended ? 'text-amber-600' : 'text-red-500'}`}>
                                    {errors.auth}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full btn-gradient hover:brightness-110 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 mt-4"
                        >
                            Login as {selectedRole}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-[color:var(--text-secondary)] font-medium">
                            Don't have an account?{' '}
                            <Link to="/contact" className="text-[#8b5cf6] font-bold hover:underline">
                                Contact Support
                            </Link>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;
