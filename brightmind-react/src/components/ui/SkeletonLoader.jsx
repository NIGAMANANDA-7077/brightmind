import React from 'react';

const SkeletonLoader = ({ type = 'text', count = 1, className = '' }) => {
    const skeletons = Array(count).fill(0);

    return (
        <>
            {skeletons.map((_, index) => {
                if (type === 'card') {
                    return (
                        <div key={index} className={`bg-gray-100 rounded-2xl animate-pulse p-4 ${className}`}>
                            <div className="h-40 bg-gray-200 rounded-xl mb-4 w-full"></div>
                            <div className="h-4 bg-gray-200 rounded-full w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded-full w-1/2"></div>
                        </div>
                    );
                }
                if (type === 'table-row') {
                    return (
                        <div key={index} className={`flex items-center gap-4 py-4 border-b border-gray-100 animate-pulse ${className}`}>
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-gray-200 rounded-full w-1/4"></div>
                                <div className="h-2 bg-gray-200 rounded-full w-1/6"></div>
                            </div>
                            <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                        </div>
                    );
                }
                return (
                    <div key={index} className={`bg-gray-200 rounded-full animate-pulse ${className}`} style={{ height: '1em' }}></div>
                );
            })}
        </>
    );
};

export default SkeletonLoader;
