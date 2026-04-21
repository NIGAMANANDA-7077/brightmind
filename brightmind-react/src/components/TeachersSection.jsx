import React, { useState, useEffect } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

import { Linkedin, Twitter, Facebook, Loader2 } from 'lucide-react';
import api from '../utils/axiosConfig';

const TeachersSection = () => {
  const [ref, visible] = useScrollAnimation({ threshold: 0.1, once: true });
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const { data } = await api.get('/users/public/teachers');
        if (data.success) {
          setTeachers(data.data); // Show all teachers as requested
        }
      } catch (error) {
        console.error('Failed to fetch teachers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);



  const fallbackTeachers = [
    { id: 'fb1', name: "Marvin McKinney", department: "UX/UI Designer", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80" },
    { id: 'fb2', name: "Cody Fisher", department: "Web Developer", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80" },
    { id: 'fb3', name: "Bessie Cooper", department: "Product Manager", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80" },
    { id: 'fb4', name: "Wade Warren", department: "Digital Marketer", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80" },
    { id: 'fb5', name: "Ronald Richards", department: "Data Scientist", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80" },
    { id: 'fb6', name: "Albert Flores", department: "Cyber Security", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80" },
  ];

  const displayTeachers = teachers.length > 0 ? teachers : fallbackTeachers;

  return (
    <section ref={ref} className={`relative pt-10 pb-20 bg-white overflow-hidden transition-all duration-1000 transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px] w-full">
          <Loader2 className="animate-spin text-[#8b5cf6]" size={40} />
        </div>
      ) : (
      <div className="container-custom relative z-10 px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-[2.2rem] md:text-[2.75rem] font-bold text-[#0f172a]">
            Meet Our Expert Team
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {displayTeachers.map((teacher, index) => (
            <div 
              key={teacher.id} 
              className="bg-white rounded-[1.5rem] shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-xl transition-shadow duration-300 flex flex-col"
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              {/* Image Section */}
              <div className="w-full h-64 sm:h-72 relative">
                <img
                  src={teacher.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.name)}&background=random`}
                  alt={teacher.name}
                  className="w-full h-full object-cover rounded-t-[1.5rem]"
                />
              </div>
              
              {/* Content Section */}
              <div className="p-6 md:p-7 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-[#0f172a] mb-1">{teacher.name}</h3>
                <p className="text-[0.95rem] font-medium text-[#8b5cf6] mb-5">
                  {teacher.subject || teacher.department || 'Expert Instructor'}
                </p>
                
                {/* Social Icons */}
                <div className="mt-auto flex items-center gap-3">
                  <a 
                    href={teacher.facebookUrl || "#"} 
                    target={teacher.facebookUrl ? "_blank" : "_self"} 
                    rel="noopener noreferrer" 
                    className="text-[#94a3b8] hover:text-[#0f172a] transition-colors"
                  >
                    <Facebook size={18} strokeWidth={2} />
                  </a>
                  <a 
                    href={teacher.twitterUrl || "#"} 
                    target={teacher.twitterUrl ? "_blank" : "_self"} 
                    rel="noopener noreferrer" 
                    className="text-[#94a3b8] hover:text-[#0f172a] transition-colors"
                  >
                    <Twitter size={18} strokeWidth={2} />
                  </a>
                  <a 
                    href={teacher.linkedinUrl || "#"} 
                    target={teacher.linkedinUrl ? "_blank" : "_self"} 
                    rel="noopener noreferrer" 
                    className="text-[#94a3b8] hover:text-[#0f172a] transition-colors"
                  >
                    <Linkedin size={18} strokeWidth={2} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}
    </section>
  );
};

export default TeachersSection;
