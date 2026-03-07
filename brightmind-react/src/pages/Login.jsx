import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, GraduationCap, School } from 'lucide-react';
import { useUser } from '../context/UserContext';

const Login = () => {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState('Student');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});

    const { login } = useUser();

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

        const result = await login(formData.email, formData.password);

        if (result.success) {
            // Verify roles match what they selected (optional but good UX)
            if (result.role !== selectedRole) {
                // To keep it simple, just log them in to their actual role's dashboard
                console.warn(`User logged in as ${result.role} despite selecting ${selectedRole}`);
            }

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
                default:
                    navigate('/');
            }
        } else {
            setErrors({ auth: result.message || 'Invalid credentials' });
        }
    };

    const handleDemoLogin = () => {
        let email = '';
        if (selectedRole === 'Admin') email = 'admin@brightmind.com';
        if (selectedRole === 'Teacher') email = 'ananay@brightmind.com';
        if (selectedRole === 'Student') email = 'priya@student.com';

        setFormData({
            email,
            password: 'password123'
        });
        setErrors({});
    };

    return (
        <div className="min-h-screen pt-24 pb-12 bg-[#fbfbfb] flex items-center justify-center px-4">
            <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 max-w-lg w-full overflow-hidden">

                {/* Header */}
                <div className="text-center pt-10 pb-6 px-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                    <p className="text-gray-500">Please select your role to login</p>
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
                                        ? `${role.activeBorder} ${role.bg}`
                                        : 'border-gray-100 hover:border-gray-200 bg-white'
                                        }`}
                                >
                                    <div className={`p-2 rounded-full mb-2 ${isSelected ? 'bg-white' : role.bg}`}>
                                        <Icon className={`w-5 h-5 ${role.color}`} />
                                    </div>
                                    <span className={`text-sm font-bold ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {role.id}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Login Form */}
                <div className="bg-gray-50 p-8 md:p-10 border-t border-gray-100">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-900 ml-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                className={`w-full px-5 py-4 rounded-xl bg-white border outline-none transition-all placeholder:text-gray-400 font-medium ${errors.email
                                    ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                                    : 'border-gray-200 focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/10'
                                    }`}
                                required
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm ml-1 font-medium animate-pulse">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-bold text-gray-900">Password</label>
                                <a href="#" className="text-sm font-semibold text-[#8b5cf6] hover:text-[#7c3aed]">Forgot Password?</a>
                            </div>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                className={`w-full px-5 py-4 rounded-xl bg-white border outline-none transition-all placeholder:text-gray-400 font-medium ${errors.password
                                    ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                                    : 'border-gray-200 focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/10'
                                    }`}
                                required
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm ml-1 font-medium animate-pulse">
                                    {errors.password}
                                </p>
                            )}
                            {errors.auth && (
                                <p className="text-red-500 text-sm ml-1 font-bold animate-pulse text-center mt-2">
                                    {errors.auth}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 mt-4"
                        >
                            Log In as {selectedRole}
                        </button>

                        <button
                            type="button"
                            onClick={handleDemoLogin}
                            className="w-full bg-white border-2 border-dashed border-gray-300 text-gray-500 hover:border-[#8b5cf6] hover:text-[#8b5cf6] py-3 rounded-xl font-bold text-base transition-all mt-4"
                        >
                            Auto-Fill Demo Credentials
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 font-medium">
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
