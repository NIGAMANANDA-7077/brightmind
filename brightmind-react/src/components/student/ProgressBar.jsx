import React from 'react';

const ProgressBar = ({ progress }) => {
    return (
        <div className="w-full bg-gray-100 rounded-full h-2">
            <div
                className="bg-[#8b5cf6] h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    );
};

export default ProgressBar;
