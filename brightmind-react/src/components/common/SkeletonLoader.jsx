import React from 'react';

const SkeletonLoader = ({ type = 'text', count = 1, className = '' }) => {
    return (
        <div className={`animate-pulse space-y-3 ${className}`}>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={`bg-gray-200 rounded-lg ${type === 'avatar' ? 'w-12 h-12 rounded-full' :
                            type === 'title' ? 'h-6 w-3/4' :
                                type === 'card' ? 'h-64 w-full rounded-2xl' :
                                    'h-4 w-full'
                        }`}
                ></div>
            ))}
        </div>
    );
};

export default SkeletonLoader;
