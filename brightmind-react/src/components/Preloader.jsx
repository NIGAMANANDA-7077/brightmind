import React from 'react';

const Preloader = () => {
    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center gap-6">
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 animate-spin" />
            </div>
            <span className="text-xl font-semibold text-indigo-600 tracking-wide">BrightMind</span>
        </div>
    );
};

export default Preloader;
