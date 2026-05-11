import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import ContactForm from '../components/ContactForm';
import ContactInfoCard from '../components/ContactInfoCard';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const Contact = () => {
    const [headerRef, headerVisible] = useScrollAnimation({ threshold: 0.1, once: true });
    const [contentRef, contentVisible] = useScrollAnimation({ threshold: 0.1, once: true });

    const contactDetails = [
        {
            icon: Mail,
            title: 'Email us',
            description: 'Email us for course inquiries, technical support, or any academic assistance.',
            contactInfo: 'nigamcut@gmail.com',
            colorClass: 'bg-[#eef2ff]' // Light Indigo
        },
        {
            icon: MapPin,
            title: 'Visit our office',
            description: 'Come say hello at our office HQ.',
            contactInfo: 'Patia, Infocity',
            colorClass: 'bg-[#f0fdf4]' // Light Green
        },
        {
            icon: Phone,
            title: 'Contact us',
            description: 'Mon-Fri from 8am to 5pm.',
            contactInfo: '+91 7077629919',
            colorClass: 'bg-[#fff7ed]' // Light Orange
        }
    ];

    return (
        <div className="pt-20">
            {/* Page Header */}
            <section className="py-20 text-center" style={{backgroundColor:'var(--bg-primary)'}}>
                <div
                    ref={headerRef}
                    className={`container-custom transition-all duration-1000 ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                >
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                        We're Here To <span className="text-[#8b5cf6]">Help!</span>
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
                        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="pb-24 pt-12" style={{backgroundColor:'var(--bg-secondary)'}}>
                <div className="container-custom">
                    <div
                        ref={contentRef}
                        className={`grid grid-cols-1 lg:grid-cols-12 gap-12 transition-all duration-1000 delay-200 ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    >
                        {/* Left Side: Form */}
                        <div className="lg:col-span-8">
                            <ContactForm />
                        </div>

                        {/* Right Side: Info Cards */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            {contactDetails.map((detail, index) => (
                                <ContactInfoCard
                                    key={index}
                                    {...detail}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
