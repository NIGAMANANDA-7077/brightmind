import React from 'react';
import { Link } from 'react-router-dom';
import { courses } from '../data/courses';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import CourseCard from './CourseCard';

import MeshBackground from './MeshBackground';

const CoursesSection = () => {
  const [gridRef, gridVisible] = useScrollAnimation({ threshold: 0.1, once: true });

  return (
    <section id="courses" className="relative py-20 md:py-28 overflow-hidden">
      <MeshBackground />
      <div className="container-custom relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white-900 -tracking-[0.03em] leading-tight">
            Most Popular <span className="text-[#a78bfa]">Courses</span>
          </h2>
          <Link to="/courses" className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-6 py-3 rounded-full font-semibold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
            View All Courses
          </Link>
        </div>

        {/* Grid */}
        <div
          ref={gridRef}
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} transition-all duration-1000 ease-out`}
        >
          {courses.slice(0, 3).map((course) => ( // limit to 3 for home page usually? Or all? Reference showed grid. Let's keep existing map. Original had map over all.
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
