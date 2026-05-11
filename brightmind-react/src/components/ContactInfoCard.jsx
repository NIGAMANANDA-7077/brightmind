import React from 'react';

const ContactInfoCard = ({ icon: Icon, title, description, contactInfo }) => {
    return (
        <div
            className="p-6 rounded-3xl transition-transform duration-300 hover:-translate-y-1"
            style={{backgroundColor:'var(--card-bg)', border:'1px solid var(--border-color)'}}
        >
            <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl shadow-sm" style={{backgroundColor:'var(--bg-secondary)'}}>
                    <Icon className="w-6 h-6 text-[#8b5cf6]" />
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-1" style={{color:'var(--text-primary)'}}>{title}</h3>
                    <p className="text-sm mb-2" style={{color:'var(--text-secondary)'}}>{description}</p>
                    <p className="font-bold text-base text-[#8b5cf6]">{contactInfo}</p>
                </div>
            </div>
        </div>
    );
};

export default ContactInfoCard;
