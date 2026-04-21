import React from 'react';
import { Quote } from 'lucide-react';
import { testimonials } from '../data/testimonials';
import { useScrollAnimation } from '../hooks/useScrollAnimation';



const TestimonialCard = ({ testimonial }) => (
  <div className="rounded-3xl p-8 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full w-[400px] flex-shrink-0 mx-4 bg-[color:var(--card-bg)] border border-[color:var(--border-color)]">
    {/* Quote Icon */}
    <div className="mb-6">
      <Quote className="w-10 h-10 text-[#8b5cf6] fill-[#8b5cf6]/20 dark:text-[#c4b5fd] dark:fill-[#c4b5fd]/15" />
    </div>

    {/* Content */}
    <p className="text-[color:var(--text-secondary)] leading-relaxed mb-8 flex-1 font-medium italic">
      "{testimonial.quote}"
    </p>

    {/* User Profile */}
    <div className="flex items-center gap-4 mt-auto">
      <img
        src={testimonial.avatar}
        alt={testimonial.name}
        className="w-12 h-12 rounded-full object-cover"
      />
      <div>
        <h4 className="font-bold text-[color:var(--text-primary)] text-base">
          {testimonial.name}
        </h4>
        <p className="text-sm text-[color:var(--text-secondary)] font-medium">
          {testimonial.role}
        </p>
      </div>
    </div>
  </div>
);

const TestimonialsSection = () => {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.2, once: true });

  return (
    <section className="relative py-20 overflow-hidden">

      <div className="container-custom relative z-10">
        <div
          ref={ref}
          className={`text-center mb-16 scroll-slide-up ${isVisible ? 'visible' : ''}`}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[color:var(--text-primary)] mb-4 leading-tight">
            What <span className="text-[#8b5cf6]">Learners Saying</span> <br />
            About <span className="text-[#8b5cf6]">BrightMind  Classes</span>
          </h2>
        </div>
      </div>

      {/* Infinite Scroll Carousel */}
      <div
        className={`relative w-full ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000 delay-300`}
        style={{ maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}
      >

        <div className="flex w-max animate-scroll hover:pause">
          {/* First Set */}
          <div className="flex">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={`t1-${testimonial.id}`} testimonial={testimonial} />
            ))}
          </div>

          {/* Duplicate Set for Loop */}
          <div className="flex">
            {testimonials.map((testimonial) => (
              <TestimonialCard key={`t2-${testimonial.id}`} testimonial={testimonial} />
            ))}
          </div>

          {/* Duplicate Set again for smoother huge screens if needed, simple duplication usually enough for standard 1920px width if content is wide enough */}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
