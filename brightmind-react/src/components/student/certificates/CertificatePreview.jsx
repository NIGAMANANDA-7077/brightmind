import React from 'react';
import { Award } from 'lucide-react';

const CertificatePreview = ({ cert }) => {
    return (
        <div className="bg-white p-1 md:p-2 shadow-2xl rounded-xl w-full mx-auto aspect-[1.414/1] relative print:shadow-none print:w-full">
            {/* Detailed Border */}
            <div className="w-full h-full border-8 border-double border-[#8b5cf6]/20 p-8 rounded-lg flex flex-col items-center justify-between bg-white relative overflow-hidden">

                {/* Background Watermark */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                    <Award size={400} />
                </div>

                {/* Header */}
                <div className="text-center space-y-4 pt-8">
                    <div className="w-20 h-20 mx-auto bg-[#8b5cf6] rounded-full flex items-center justify-center text-white mb-6 shadow-xl shadow-purple-500/20">
                        <Award size={48} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif text-gray-900 font-bold uppercase tracking-widest leading-none">
                        Certificate <span className="block text-xl md:text-2xl pt-2 font-sans normal-case text-gray-400 tracking-normal font-medium">of Completion</span>
                    </h1>
                </div>

                {/* Content */}
                <div className="text-center space-y-2 flex-grow flex flex-col justify-center">
                    <p className="text-gray-500 text-lg">This certifies that</p>
                    <h2 className="text-3xl md:text-5xl font-bold text-[#8b5cf6] font-serif italic py-4">
                        {cert.studentName}
                    </h2>
                    <p className="text-gray-500 text-lg">has successfully completed the course</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 max-w-2xl mx-auto leading-tight">
                        {cert.title}
                    </h3>
                    <p className="text-gray-500 pt-4">on {cert.completedAt}</p>
                </div>

                {/* Footer Signatures */}
                <div className="w-full grid grid-cols-2 gap-20 pt-12 pb-8">
                    <div className="text-center">
                        <div className="w-32 mx-auto border-b-2 border-gray-300 pb-2 mb-2 font-script text-2xl text-gray-600">
                            Sarah Jenkins
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Director</p>
                    </div>
                    <div className="text-center">
                        <div className="w-32 mx-auto border-b-2 border-gray-300 pb-2 mb-2 font-script text-2xl text-gray-600">
                            {cert.instructor}
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{cert.instructorRole}</p>
                    </div>
                </div>

                {/* Validation Code */}

            </div>

            {/* Corner Decorations */}
            <div className="absolute top-0 left-0 w-24 h-24 border-t-8 border-l-8 border-[#8b5cf6] rounded-tl-lg opacity-20"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-8 border-r-8 border-[#8b5cf6] rounded-br-lg opacity-20"></div>
        </div>
    );
};

export default CertificatePreview;
