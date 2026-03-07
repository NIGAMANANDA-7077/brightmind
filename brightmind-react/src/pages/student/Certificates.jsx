import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CertificateCard from '../../components/student/certificates/CertificateCard';
import PageTransition from '../../components/common/PageTransition';
import api from '../../utils/axiosConfig';
import { Loader2, Award } from 'lucide-react';

const Certificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const res = await api.get('/certificates/my-certificates');
                if (res.data.success) {
                    // Map backend data to frontend component expected structure
                    const mappedCerts = res.data.certificates.map(cert => ({
                        id: cert.id,
                        title: `${cert.courseTitle} Completion Certificate`,
                        course: cert.courseTitle,
                        issueDate: new Date(cert.issueDate).toLocaleDateString(),
                        status: 'Issued',
                        image: cert.courseThumbnail || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80",
                        issuedBy: cert.issuedBy || 'Admin'
                    }));
                    setCertificates(mappedCerts);
                }
            } catch (err) {
                console.error("Failed to fetch certificates:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCertificates();
    }, []);

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#8b5cf6]" size={40} />
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
                    <p className="text-gray-500 mt-1">Showcase your achievements</p>
                </div>

                {certificates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {certificates.map(cert => (
                            <Link to={`/student/certificate/${cert.id}`} key={cert.id} className="block group">
                                <CertificateCard cert={cert} />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <Award className="mx-auto text-gray-300 mb-4" size={48} />
                        <p className="text-gray-500 font-medium">No certificates earned yet. Complete courses & assignments to get certified!</p>
                    </div>
                )}
            </div>
        </PageTransition>
    );
};

export default Certificates;
