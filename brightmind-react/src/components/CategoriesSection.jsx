import React, { useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { categories } from '../data/categories';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

import MeshBackground from './MeshBackground';

const CategoriesSection = () => {
  const scrollRef = useRef(null);
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.1, once: true });

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 350; // Approx card width + gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <MeshBackground />
      <div className="container-custom relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Left Side - Content & Navigation */}
          <div
            ref={ref}
            className={`w-full lg:w-1/3 flex flex-col items-start ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'} transition-all duration-1000`}
          >
            <h2 className="text-5xl md:text-6xl font-bold text-[color:var(--text-primary)] leading-tight mb-8">
              Explore Course <br />
              <span className="text-[#8b5cf6]">Categories</span>
            </h2>

            <p className="text-[color:var(--text-secondary)] text-lg mb-12 max-w-sm leading-relaxed">
              Browse our wide range of categories and find the perfect course for your career.
            </p>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => scroll('left')}
                className="w-14 h-14 rounded-full border border-[#8b5cf6] text-[#8b5cf6] flex items-center justify-center hover:bg-[#8b5cf6] hover:text-white transition-all duration-300 group"
                aria-label="Previous"
              >
                <ArrowLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-14 h-14 rounded-full bg-[#8b5cf6] text-white flex items-center justify-center hover:bg-[#7c3aed] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 group"
                aria-label="Next"
              >
                <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Right Side - Carousel */}
          <div
            className={`w-full lg:w-2/3 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'} transition-all duration-1000 delay-300`}
          >
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <div
                    key={category.id}
                    className={`min-w-[280px] md:min-w-[320px] p-8 rounded-[2rem] ${category.color} flex flex-col justify-between h-[320px] snap-center hover:scale-[1.02] transition-transform duration-300 cursor-pointer dark:bg-[color:var(--card-bg)] dark:border dark:border-[color:var(--border-color)]`}
                  >
                    <div>
                      {/* Icon Box */}
                      <div className={`w-14 h-14 ${category.iconBg || 'bg-white/50'} rounded-xl flex items-center justify-center mb-8 dark:bg-[color:var(--bg-secondary)]`}>
                        <Icon className={`w-7 h-7 ${category.iconColor || 'text-gray-900'} dark:text-[color:var(--text-primary)]`} />
                      </div>

                      <h3 className="text-2xl font-bold text-[color:var(--text-primary)] mb-2">
                        {category.name}
                      </h3>
                    </div>

                    <div className="mt-auto">
                      <p className="text-[color:var(--text-secondary)] font-medium text-sm">
                        {category.courses} Courses • {category.webinars} Webinar
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
