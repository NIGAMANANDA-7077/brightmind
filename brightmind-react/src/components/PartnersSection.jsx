import React from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';



const PartnersSection = () => {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.2, once: true });

  const partners = [
    { id: 1, name: "Google" },
    { id: 2, name: "Microsoft" },
    { id: 3, name: "Amazon" },
    { id: 4, name: "Meta" },
    { id: 5, name: "Apple" },
    { id: 6, name: "Netflix" },
    { id: 7, name: "Adobe" },
    { id: 8, name: "IBM" },
  ];

  return (
    <section className="relative py-16 overflow-hidden">

      <div className="container-custom mb-12 relative z-10">
        <div
          ref={ref}
          className={`text-center scroll-slide-up ${isVisible ? 'visible' : ''}`}
        >
          <p className="text-gray-600 font-medium">
            Featured by popular companies in the industry
          </p>
        </div>
      </div>

      {/* Infinite Scroll Carousel */}
      <div
        className={`relative w-full ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000 delay-300`}
        style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
      >


        <div className="flex w-[200%] animate-scroll hover:pause">
          {/* First Set */}
          <div className="flex w-1/2 justify-around items-center gap-12 px-12">
            {partners.map((partner) => (
              <div
                key={`p1-${partner.id}`}
                className="flex items-center justify-center min-w-[120px]"
              >
                <div className="text-xl md:text-2xl font-bold text-gray-400 hover:text-gray-600 transition-colors whitespace-nowrap cursor-default">
                  {partner.name}
                </div>
              </div>
            ))}
          </div>

          {/* Duplicate Set for Loop */}
          <div className="flex w-1/2 justify-around items-center gap-12 px-12">
            {partners.map((partner) => (
              <div
                key={`p2-${partner.id}`}
                className="flex items-center justify-center min-w-[120px]"
              >
                <div className="text-xl md:text-2xl font-bold text-gray-400 hover:text-gray-600 transition-colors whitespace-nowrap cursor-default">
                  {partner.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
