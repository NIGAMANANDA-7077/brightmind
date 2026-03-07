import React from 'react';
import { Download, Share2, Award } from 'lucide-react';

const CertificateCard = ({ cert }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
            <div className="h-48 bg-gray-100 relative overflow-hidden flex items-center justify-center">
                {/* Mock Certificate Preview */}
                <div className="absolute inset-0 bg-[#8b5cf6]/5 flex items-center justify-center">
                    <Award className="text-[#8b5cf6] opacity-20" size={64} />
                </div>
                <img src={cert.thumbnail} alt={cert.title} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button className="bg-white text-gray-900 font-bold py-2 px-4 rounded-xl shadow-lg transform scale-90 group-hover:scale-100 transition-all">
                        Preview
                    </button>
                </div>
            </div>

            <div className="p-5">
                <h3 className="font-bold text-gray-900 line-clamp-1 mb-1">{cert.title}</h3>
                <p className="text-xs text-gray-500 mb-4">Issued on {cert.date}</p>

                <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#8b5cf6] text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/20 hover:bg-[#7c3aed] transition-colors">
                        <Download size={16} /> PDF
                    </button>
                    <button className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 transition-colors">
                        <Share2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CertificateCard;
