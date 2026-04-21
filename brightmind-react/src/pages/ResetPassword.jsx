import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, Loader2, XCircle } from 'lucide-react';
import api from '../utils/axiosConfig';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setStatus('error');
            setMessage('Password must be at least 6 characters.');
            return;
        }

        setStatus('loading');
        setMessage('');
        try {
            const { data } = await api.post(`/auth/reset-password/${token}`, { password });
            if (data.success) {
                setStatus('success');
                setMessage(data.message);
                setTimeout(() => navigate('/login'), 3000);
            }
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Link is invalid or expired. Please request a new one.');
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 theme-surface flex items-center justify-center px-4 transition-colors duration-300">
            <div className="theme-card rounded-[2rem] shadow-xl max-w-lg w-full overflow-hidden">

                {/* Header */}
                <div className="text-center pt-10 pb-6 px-8">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-[#8b5cf6]" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Set New Password</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Your new password must be at least 6 characters.
                    </p>
                </div>

                <div className="bg-[color:var(--bg-secondary)] p-8 md:p-10 border-t border-[color:var(--border-color)]">
                    {status === 'success' ? (
                        <div className="text-center py-4">
                            <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Password Reset!</h2>
                            <p className="text-gray-500 text-sm mb-4">{message}</p>
                            <p className="text-gray-400 text-xs">Redirecting to login in 3 seconds...</p>
                            <Link to="/login" className="inline-flex items-center gap-2 text-[#8b5cf6] font-semibold hover:underline mt-4">
                                Go to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* New Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[color:var(--text-primary)] ml-1">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setMessage(''); setStatus('idle'); }}
                                        placeholder="Enter new password"
                                        className="w-full px-5 py-4 rounded-xl input-surface border border-[color:var(--border-color)] focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/10 outline-none transition-all placeholder:text-gray-400 font-medium pr-12"
                                        required
                                        disabled={status === 'loading'}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[color:var(--text-primary)] ml-1">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => { setConfirmPassword(e.target.value); setMessage(''); setStatus('idle'); }}
                                        placeholder="Confirm new password"
                                        className="w-full px-5 py-4 rounded-xl input-surface border border-[color:var(--border-color)] focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/10 outline-none transition-all placeholder:text-gray-400 font-medium pr-12"
                                        required
                                        disabled={status === 'loading'}
                                    />
                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {status === 'error' && (
                                <div className="flex items-center gap-2 text-red-500 text-sm font-medium bg-red-50 rounded-xl px-4 py-3">
                                    <XCircle size={16} className="flex-shrink-0" />
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full btn-gradient hover:brightness-110 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {status === 'loading' ? (
                                    <><Loader2 className="animate-spin" size={20} /> Resetting...</>
                                ) : (
                                    'Reset Password'
                                )}
                            </button>

                            <div className="text-center pt-1">
                                <Link to="/forgot-password" className="text-sm text-[color:var(--text-secondary)] hover:text-[#8b5cf6] font-medium">
                                    Request a new link
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
