import React from 'react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

import MeshBackground from './MeshBackground';

const CTASection = () => {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.2, once: true });

  const floatingImages = [
    {
      src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
      shape: "rounded-xl rotate-[-12deg]",
      position: "top-[15%] left-[10%] md:left-[15%]",
      size: "w-16 h-16 md:w-20 md:h-20"
    },
    {
      src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
      shape: "shape-hexagon rotate-[12deg]",
      position: "top-[20%] right-[10%] md:right-[15%]",
      size: "w-16 h-16 md:w-20 md:h-20 "
    },
    {
      src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=300&q=80",
      shape: "shape-blob rotate-[-6deg]",
      position: "bottom-[20%] left-[15%] md:left-[20%]",
      size: "w-20 h-20 md:w-24 md:h-24"
    },
    {
      src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
      shape: "rounded-full rotate-[12deg]", // Simulating star/flower with simple circle for now or custom clip-path if needed
      position: "bottom-[15%] right-[15%] md:right-[20%]",
      size: "w-16 h-16 md:w-20 md:h-20"
    }
  ];

  return (
    <section id="contact" className="relative py-20 overflow-hidden">
      <MeshBackground />
      <div className="container-custom relative z-10">
        <div
          ref={ref}
          className={`relative bg-[#8b5cf6] rounded-[3rem] p-12 md:p-24 text-center overflow-hidden transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          {/* Main Content */}
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Take the First Step – <br /> Start Learning Today!
            </h2>

            <div className="pt-4">
              <Link to="/contact" className="bg-white text-gray-900 hover:bg-gray-50 font-bold text-sm md:text-base px-10 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1">
                Contact Us
              </Link>
            </div>
          </div>

          {/* Floating Images */}
          {floatingImages.map((img, index) => (
            <div
              key={index}
              className={`absolute ${img.position} ${isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} transition-all duration-700 delay-[${400 + index * 100}ms] ease-out hover:scale-110 cursor-pointer hidden md:block`}
            >
              <div className={`${img.size} shadow-xl border-4 border-white/20 overflow-hidden ${img.shape} animate-float`}>
                <img
                  src={img.src}
                  alt="Student"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}

          {/* Decorative Background Blobs */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

        </div>
      </div>
    </section>
  );
};

export default CTASection;
