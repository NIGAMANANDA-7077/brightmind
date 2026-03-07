import React, { useState } from 'react';

const ContactForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        date: '',
        message: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate form submission
        console.log('Form Submitted:', formData);
        alert('Message sent! We will get back to you soon.');
        setFormData({ name: '', email: '', phone: '', date: '', message: '' });
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
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none transition-all placeholder:text-gray-400"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email Address"
                            required
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none transition-all placeholder:text-gray-400"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Phone Number"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none transition-all placeholder:text-gray-400"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">Date</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none transition-all text-gray-500"
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
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 outline-none transition-all placeholder:text-gray-400 resize-none"
                    ></textarea>
                </div>

                <button
                    type="submit"
                    className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-4 rounded-xl font-bold text-lg w-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                    Send Message
                </button>
            </form>
        </div>
    );
};

export default ContactForm;
