import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Share2, Award, Star, Loader2 } from 'lucide-react';
import CertificatePreview from '../../components/student/certificates/CertificatePreview';
import api from '../../utils/axiosConfig';

const CertificateDetail = () => {
    const { certificateId } = useParams();
    const navigate = useNavigate();
    const [cert, setCert] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCertificate = async () => {
            try {
                // Fetch all and find locally, or implement GET /certificates/:id
                const res = await api.get('/certificates/my-certificates');
                if (res.data.success) {
                    const found = res.data.certificates.find(c => c.id === parseInt(certificateId));
                    if (found) {
                        setCert({
                            id: found.id,
                            studentName: "Student", // Ideally get from user context
                            course: found.courseTitle,
                            issueDate: new Date(found.issueDate).toLocaleDateString(),
                            grade: 'A+', // Mocked unless stored in DB
                            scores: { quizzes: 95, assignments: 90 }, // Mocked unless tracked
                            issuedBy: found.issuedBy || 'Bright MIND Admin'
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to fetch certificate details", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCertificate();
    }, [certificateId]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-[#8b5cf6]" size={40} />
            </div>
        );
    }

    if (!cert) {
        return <div className="p-8 text-center text-gray-500">Certificate not found. Ensure you have been issued this certificate.</div>;
    }

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // Mock download
        alert("Certificate downloading... (Mock)");
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in print:p-0">
            {/* Navigation - Hidden on Print */}
            <div className="flex items-center justify-between print:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
                >
                    <ArrowLeft size={20} /> Back to Certificates
                </button>


            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Content - Certificate Preview */}
                <div className="flex-1">
                    <CertificatePreview cert={cert} />

                    {/* Action Bar - Hidden on Print */}
                    <div className="flex justify-center gap-4 mt-8 print:hidden">
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-95"
                        >
                            <Download size={20} /> Download PDF
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                        >
                            <Printer size={20} /> Print
                        </button>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                        >
                            <Share2 size={20} /> Share
                        </button>
                    </div>
                </div>

                {/* Sidebar Stats - Hidden on Print */}
                <div className="w-full lg:w-80 shrink-0 space-y-6 print:hidden">

                    <div className="bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] p-6 rounded-3xl shadow-xl text-center text-white relative overflow-hidden">
                        <Award size={100} className="absolute -top-4 -right-4 opacity-20 rotate-12" />
                        <div className="relative z-10">
                            <h3 className="font-bold text-xl mb-1">Share Achievement</h3>
                            <p className="text-purple-100 text-sm mb-4">Post your certificate on LinkedIn to showcase your skills.</p>
                            <button className="w-full py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold transition-colors">
                                Share on LinkedIn
                            </button>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default CertificateDetail;
