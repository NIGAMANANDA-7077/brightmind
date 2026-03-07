import React from 'react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const StatsSection = () => {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.2, once: true });

  const stats = [
    {
      value: "500+",
      label: "BrightMind  Classes offers 500+ hours of expert courses, covering diverse subjects for growth and skill development.",
    },
    {
      value: "100,000 +",
      label: "Join 100,000+ students and access 500+ hours of expert-led courses with BrightMind  Classes.",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left Side - Image with Floating Card */}
          <div
            ref={ref}
            className={`relative w-full lg:w-1/2 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'} transition-all duration-1000 ease-out`}
          >
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl h-[500px] md:h-[600px] w-full group">
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80"
                alt="Student learning with tablet"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />

              {/* Floating Stat Card */}
              <div className="absolute bottom-8 left-8 bg-white p-6 rounded-3xl shadow-xl max-w-xs animate-float hidden md:block">
                <p className="text-gray-900 font-bold text-lg leading-tight mb-2">
                  Average class completion rate
                </p>
                <div className="text-5xl font-bold text-[#8b5cf6]">
                  93%
                </div>
              </div>
            </div>

            {/* Background decorative blob */}
            <div className="absolute -z-10 top-10 -left-10 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-60"></div>
          </div>

          {/* Right Side - Content */}
          <div className={`w-full lg:w-1/2 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'} transition-all duration-1000 delay-300 ease-out`}>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Unlocking Knowledge with <span className="text-[#8b5cf6]">BrightMind  Classes</span>
            </h2>

            <p className="text-gray-600 text-lg mb-12 leading-relaxed max-w-xl">
              BrightMind  Classes offers a cutting-edge learning experience designed to
              enhance knowledge and skills. With innovative teaching methods and
              personalized learning.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
              {stats.map((stat, index) => (
                <div key={index}>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <Link to="/courses" className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-semibold px-8 py-3.5 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
              Explore Courses
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
