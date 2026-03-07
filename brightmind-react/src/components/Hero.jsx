import React from 'react';
import { Link } from 'react-router-dom';
import MeshBackground from './MeshBackground';

const Hero = () => {
  return (
    <section id="home" className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden min-h-screen flex items-center justify-center isolate">
      <MeshBackground />
      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight tracking-tight mb-6 animate-fade-in-up">
            Learn and Grow with <br className="hidden md:block" />
            <span className="text-[#8b5cf6]">Top Online Courses</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up-delay-1">
            Discover top online courses to upgrade your skills and stay ahead.
            Learn from experts and enhance your expertise at your own pace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up-delay-2">
            <Link to="/courses" className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-semibold px-8 py-3.5 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1">
              Explore Courses
            </Link>
            <Link to="/contact" className="bg-white hover:bg-gray-50 text-gray-900 font-semibold px-8 py-3.5 rounded-full border border-gray-300 transition-all duration-300 hover:shadow-md">
              Contact Us
            </Link>
          </div>


        </div>
      </div>

      {/* Floating Images - Hidden on mobile, visible on medium+ screens */}

      {/* Top Left - Rounded Square Purple */}
      <div className="absolute top-[20%] left-[5%] lg:left-[10%] hidden md:block animate-float">
        <div className="w-16 h-16 lg:w-20 lg:h-20 bg-[#a78bfa] rounded-2xl rotate-[-10deg] overflow-hidden shadow-xl border-4 border-white">
          <img
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80"
            alt="Student"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Top Right - Hexagon Orange */}
      <div className="absolute top-[25%] right-[5%] lg:right-[10%] hidden md:block animate-float-delayed">
        <div className="w-16 h-16 lg:w-24 lg:h-24 bg-[#fb923c] shape-hexagon shadow-xl border-4 border-white overflow-hidden flex items-center justify-center">
          <div className="w-full h-full shape-hexagon overflow-hidden bg-[#fb923c]">
            <img
              src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80"
              alt="Student"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Bottom Left - Hexagon Orange/Pink */}
      <div className="absolute bottom-[20%] left-[8%] lg:left-[15%] hidden md:block animate-float-delayed">
        <div className="w-20 h-20 lg:w-28 lg:h-28 bg-[#fb7185] shape-hexagon shadow-xl flex items-center justify-center overflow-hidden">
          <div className="w-full h-full shape-hexagon overflow-hidden bg-[#fb7185]">
            <img
              src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=300&q=80"
              alt="Student"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Bottom Right - Blob Teal */}
      <div className="absolute bottom-[15%] right-[8%] lg:right-[12%] hidden md:block animate-float">
        <div className="w-16 h-16 lg:w-24 lg:h-24 bg-[#2dd4bf] shape-blob shadow-xl overflow-hidden flex items-center justify-center border-4 border-white">
          <img
            src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=300&q=80"
            alt="Student"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Decorative Dots/Shapes similar to image */}
      <div className="absolute top-[15%] left-[20%] w-3 h-3 bg-yellow-400 rounded-full hidden lg:block"></div>
      <div className="absolute top-[40%] right-[25%] w-2 h-2 bg-purple-400 rounded-full hidden lg:block"></div>
      <div className="absolute bottom-[30%] left-[30%] w-4 h-4 bg-teal-400 rounded-full hidden lg:block"></div>

    </section>
  );
};

export default Hero;
