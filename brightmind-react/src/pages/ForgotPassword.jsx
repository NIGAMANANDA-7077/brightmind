import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import api from '../utils/axiosConfig';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle | loading | success | error
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');
        try {
            const { data } = await api.post('/auth/forgot-password', { email });
            if (data.success) {
                setStatus('success');
                setMessage(data.message);
            }
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 theme-surface flex items-center justify-center px-4 transition-colors duration-300">
            <div className="theme-card rounded-[2rem] shadow-xl max-w-lg w-full overflow-hidden">

                {/* Header */}
                <div className="text-center pt-10 pb-6 px-8">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-[#8b5cf6]" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Forgot Password?</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        No worries! Enter your registered email and we'll send you a reset link.
                    </p>
                </div>

                <div className="bg-[color:var(--bg-secondary)] p-8 md:p-10 border-t border-[color:var(--border-color)]">
                    {status === 'success' ? (
                        <div className="text-center py-4">
                            <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Check your email!</h2>
                            <p className="text-gray-500 text-sm mb-6">{message}</p>
                            <p className="text-gray-400 text-xs mb-6">The link expires in 15 minutes. Check your spam folder if you don't see it.</p>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-[#8b5cf6] font-semibold hover:underline"
                            >
                                <ArrowLeft size={16} /> Back to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[color:var(--text-primary)] ml-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your registered email"
                                    className="w-full px-5 py-4 rounded-xl input-surface border border-[color:var(--border-color)] focus:border-[#8b5cf6] focus:ring-4 focus:ring-[#8b5cf6]/10 outline-none transition-all placeholder:text-gray-400 font-medium"
                                    required
                                    disabled={status === 'loading'}
                                />
                            </div>

                            {status === 'error' && (
                                <p className="text-red-500 text-sm font-medium text-center">{message}</p>
                            )}

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full btn-gradient hover:brightness-110 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {status === 'loading' ? (
                                    <><Loader2 className="animate-spin" size={20} /> Sending...</>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>

                            <div className="text-center pt-2">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-1.5 text-sm text-[color:var(--text-secondary)] hover:text-[#8b5cf6] font-medium transition-colors"
                                >
                                    <ArrowLeft size={15} /> Back to Login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
