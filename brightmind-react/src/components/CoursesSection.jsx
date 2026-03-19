import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CourseCard from './CourseCard';
import MeshBackground from './MeshBackground';

const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60';

function normalise(c) {
    return {
        id: c.id,
        title: c.title,
        image: c.thumbnail || DEFAULT_THUMBNAIL,
        rating: c.rating || 4.5,
        lessons: c.lessonsCount || 0,
        duration: c.duration || 'Self-paced',
        students: c.studentsEnrolled || 0,
        price: Number(c.price) || 0,
        instructor: {
            name: c.createdByAdminName || c.instructor || 'Admin',
            avatar: c.instructorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.createdByAdminName || 'Admin')}&background=random`,
        },
    };
}

const CoursesSection = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/courses/public`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        setCourses((Array.isArray(data) ? data : []).slice(0, 3).map(normalise));
      })
      .catch(err => {
        console.error('[CoursesSection] Failed to load courses:', err);
      })
      .finally(() => setLoading(false));
  }, []);

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
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#8b5cf6] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : courses.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No courses available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CoursesSection;

