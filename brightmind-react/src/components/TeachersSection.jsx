import React from 'react';
import { Quote } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import MeshBackground from './MeshBackground';

const TeachersSection = () => {
  const [ref, visible] = useScrollAnimation({ threshold: 0.1, once: true });

  const teachers = [
    { id: 1, image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80" },
    { id: 2, image: "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?auto=format&fit=crop&w=150&q=80" },
    { id: 3, image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
    { id: 4, image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=150&q=80" },
  ];

  // Images for Indian context
  // Left: Student with laptop
  const studentLaptop = "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80"; // Using a high quality sports/student img as placeholder or finding better one
  // Let's use a more specific academic one
  const studentLaptopBetter = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"; // Student on laptop

  // Right: Student with tablet
  const studentTablet = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"; // Students
  // Better tablet one
  const studentTabletBetter = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80";

  // Real Indian choices for "exact" request if possible, or visually similar
  const imgLeft = "https://images.unsplash.com/photo-1610484826967-09c5720778c7?auto=format&fit=crop&w=800&q=80"; // Man with laptop
  const imgRight = "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&w=800&q=80"; // Student with tablet/studying

  return (
    <section ref={ref} className={`relative py-16 md:py-24 overflow-hidden transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <MeshBackground />
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[500px]">

          {/* Left Large Image - Student with Laptop */}
          <div className="lg:col-span-4 relative rounded-[2.5rem] overflow-hidden shadow-lg h-[300px] lg:h-full group">
            <img
              src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1000&q=80"
              alt="Student learning online"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>

          {/* Middle Column - Stacked Cards */}
          <div className="lg:col-span-4 flex flex-col gap-6 h-full">

            {/* Top Card - Teachers Count */}
            <div className="flex-1 bg-[#ff9b85] rounded-[2.5rem] p-8 flex flex-col justify-center items-start shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex -space-x-4 mb-6 pl-2">
                {teachers.map((teacher, idx) => (
                  <img
                    key={teacher.id}
                    src={teacher.image}
                    alt={`Teacher ${idx}`}
                    className="w-14 h-14 rounded-full border-4 border-white object-cover"
                  />
                ))}
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                We have 40+ <br />
                Professional Teachers
              </h3>
            </div>

            {/* Bottom Card - Quote */}
            <div className="flex-1 bg-[#6ee7b7] rounded-[2.5rem] p-8 flex flex-col justify-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <p className="font-medium text-xl md:text-2xl text-gray-900 leading-relaxed mb-6">
                "Believe in yourself, keep learning, and success will follow."
              </p>
              <div>
                <p className="font-bold text-lg text-gray-900">Mathew S.</p>
                <p className="text-sm text-gray-700">Quote from our teacher</p>
              </div>
            </div>

          </div>

          {/* Right Tall Image - Student with Tablet */}
          <div className="lg:col-span-4 relative rounded-[2.5rem] overflow-hidden shadow-lg h-[400px] lg:h-full group">
            <img
              src="https://images.unsplash.com/photo-1522881193457-37ae97c905bf?auto=format&fit=crop&w=1000&q=80"
              alt="Student with tablet"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TeachersSection;
