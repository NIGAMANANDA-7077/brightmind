import React from 'react';

const ContactInfoCard = ({ icon: Icon, title, description, contactInfo, colorClass }) => {
    return (
        <div className={`p-6 rounded-3xl ${colorClass} transition-transform duration-300 hover:-translate-y-1`}>
            <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-2xl shadow-sm">
                    <Icon className="w-6 h-6 text-gray-900" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{description}</p>
                    <p className="font-bold text-gray-900 text-base">{contactInfo}</p>
                </div>
            </div>
        </div>
    );
};

export default ContactInfoCard;
