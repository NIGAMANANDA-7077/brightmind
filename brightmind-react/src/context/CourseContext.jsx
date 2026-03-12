import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import { useUser } from './UserContext';

const CourseContext = createContext();

export const useCourse = () => {
    const context = useContext(CourseContext);
    if (!context) {
        throw new Error('useCourse must be used within a CourseProvider');
    }
    return context;
};

export const CourseProvider = ({ children }) => {
    const { user } = useUser();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch ONLY courses the student is enrolled in, with their specific progress
    const fetchEnrolledCourses = async () => {
        if (!user || user.role !== 'Student') {
            setCourses([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await api.get('/enrollments/my-courses');

            // For each course, fetch its specific completed lessons
            const enhancedCourses = await Promise.all(res.data.courses.map(async (course) => {
                const progressRes = await api.get(`/enrollments/progress/${course.id}`);
                const completedLessonIds = progressRes.data.completedLessons.map(p => p.lessonId);

                // Map over the course modules to inject the isCompleted flag dynamically
                // Support both 'courseModules' (new) and 'modules' (old/fallback)
                const sourceModules = course.courseModules || course.modules || [];
                const updatedModules = sourceModules.map(module => ({
                    ...module,
                    title: module.moduleTitle || module.title, // Standardize title
                    lessons: (module.lessons || []).map(lesson => ({
                        ...lesson,
                        title: lesson.lessonTitle || lesson.title, // Standardize lesson title
                        isCompleted: completedLessonIds.includes(lesson.id)
                    }))
                }));

                const allLessons = updatedModules.flatMap(m => m.lessons || []);
                const totalLessons = allLessons.length;
                const completedCount = allLessons.filter(l => l.isCompleted).length;

                return {
                    ...course,
                    modules: updatedModules, // Keep it as 'modules' for frontend components
                    totalLessons,
                    completedLessons: completedCount,
                    progress: course.progress || 0
                };
            }));

            setCourses(enhancedCourses);
        } catch (err) {
            console.error("Failed to fetch enrolled courses:", err);
            setCourses([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnrolledCourses();
    }, [user]);

    const getCourse = (courseId) => {
        return courses.find(c => c.id === courseId);
    };

    const markLessonComplete = async (courseId, moduleId, lessonId) => {
        const course = getCourse(courseId);
        if (!course) return;

        try {
            // Wait for backend to confirm progress update
            const res = await api.post('/enrollments/progress/mark-complete', {
                courseId,
                moduleId,
                lessonId
            });

            if (res.data.success) {
                // Optimistically update local state to avoid full re-fetch
                const updatedModules = (course.modules || []).map(module => {
                    if (module.id !== moduleId) return module;
                    return {
                        ...module,
                        lessons: (module.lessons || []).map(lesson => {
                            if (lesson.id !== lessonId) return lesson;
                            return { ...lesson, isCompleted: true };
                        })
                    };
                });

                const completedCount = course.completedLessons + 1;

                setCourses(prev => prev.map(c => c.id === courseId ? {
                    ...c,
                    modules: updatedModules,
                    completedLessons: completedCount,
                    progress: res.data.progressPercentage
                } : c));
            }
        } catch (err) {
            console.error("Failed to mark lesson complete in backend", err);
        }
    };

    const getProgress = (courseId) => {
        const course = getCourse(courseId);
        if (!course || !course.totalLessons) return 0;
        return Math.round((course.completedLessons / course.totalLessons) * 100);
    };

    const getCompletedLessonsCount = (courseId) => {
        const course = getCourse(courseId);
        if (!course) return 0;
        return course.completedLessons || 0;
    };

    const value = {
        courses,
        loading,
        getCourse,
        markLessonComplete,
        getProgress,
        getCompletedLessonsCount,
        refreshCourses: fetchEnrolledCourses
    };

    return (
        <CourseContext.Provider value={value}>
            {children}
        </CourseContext.Provider>
    );
};
