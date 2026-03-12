import React, { useState } from 'react';

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        date: '',
        message: ''
    });

    const [status, setStatus] = useState({ loading: false, success: false, error: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Reset error message when user starts typing
        if (status.error) setStatus(prev => ({ ...prev, error: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Gmail validation
        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!gmailRegex.test(formData.email)) {
            setStatus({ loading: false, success: false, error: 'Only Gmail addresses (@gmail.com) are allowed.' });
            return;
        }

        setStatus({ loading: true, success: false, error: '' });

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_URL}/contact`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (result.success) {
                setStatus({ loading: false, success: true, error: '' });
                setFormData({ name: '', email: '', phone: '', date: '', message: '' });
                setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 5000);
            } else {
                setStatus({ loading: false, success: false, error: result.message || 'Something went wrong.' });
            }
        } catch (error) {
            setStatus({ loading: false, success: false, error: 'Failed to send message. Please try again later.' });
        }
    };

    return (
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-gray-100">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Send us a Message</h2>
                <p className="text-gray-500">Your email address will not be published. Required fields are marked *</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">Name *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Full Name"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-100 focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none transition-all text-black placeholder:text-gray-400"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email Address (@gmail.com only)"
                            required
                            className={`w-full px-4 py-3 rounded-xl bg-white border ${status.error && formData.email && !formData.email.endsWith('@gmail.com') ? 'border-red-500' : 'border-gray-100'} focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none transition-all text-black placeholder:text-gray-400`}
                        />
                    </div>
                </div>

                {status.error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                        {status.error}
                    </div>
                )}

                {status.success && (
                    <div className="p-4 bg-green-50 border border-green-100 text-green-600 rounded-xl text-sm font-medium">
                        Message sent successfully to iamnigam07@gmail.com!
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Phone Number"
                            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-100 focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none transition-all text-black placeholder:text-gray-400"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">Date</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-100 focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none transition-all text-black"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">Message *</label>
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows="6"
                        placeholder="Write your message here..."
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-100 focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none transition-all text-black placeholder:text-gray-400 resize-none"
                    ></textarea>
                </div>

                <button
                    type="submit"
                    disabled={status.loading}
                    className={`bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-4 rounded-xl font-bold text-lg w-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${status.loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {status.loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                        </span>
                    ) : 'Send Message'}
                </button>
            </form>
        </div>
    );
};

export default ContactForm;
