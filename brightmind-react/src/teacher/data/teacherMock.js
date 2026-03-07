// =========================================================
// teacherMock.js  —  Dummy data for Teacher Panel
// Replace each export with an API call when backend is ready
// =========================================================

import { BookOpen, Users, ClipboardList, CheckCircle } from 'lucide-react';

// ----- Teacher Profile -----------------------------------------
export const teacherProfile = {
    id: 'T001',
    name: 'Ananay Sharma',
    email: 'ananay@brightmind.com',
    phone: '',
    subject: 'Computer Science',
    department: 'Science',
    qualification: 'Ph.D. Physics, IIT Delhi',
    experience: '8 Years',
    bio: 'Passionate educator with a focus on making complex concepts simple and accessible to all students.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya',
    joinedDate: '2018-06-15',
};

// ----- Dashboard Stats -----------------------------------------
export const teacherStats = [
    {
        title: 'Total Courses',
        value: 1,
        change: '+1 this month',
        trend: 'up',
        icon: BookOpen,
        color: 'bg-purple-100 text-purple-600',
        link: '/teacher/courses',
    },
    {
        title: 'Total Students',
        value: 1,
        change: '+1 this week',
        trend: 'up',
        icon: Users,
        color: 'bg-blue-100 text-blue-600',
        link: '/teacher/students',
    },
    {
        title: 'Assignments',
        value: 1,
        change: 'Due soon',
        trend: 'neutral',
        icon: ClipboardList,
        color: 'bg-orange-100 text-orange-600',
        link: '/teacher/assignments',
    },
    {
        title: 'Pending Grading',
        value: 0,
        change: 'All caught up',
        trend: 'up',
        icon: CheckCircle,
        color: 'bg-green-100 text-green-600',
        link: '/teacher/assignments',
    },
];

// ----- Recent Activity -----------------------------------------
export const recentActivity = [
    {
        id: 1,
        user: 'Rahul Sharma',
        action: 'submitted',
        target: 'Physics Assignment 3',
        time: '10 mins ago',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
    },
    {
        id: 2,
        user: 'Priya Patel',
        action: 'enrolled in',
        target: 'Mathematics 101',
        time: '1 hour ago',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    },
    {
        id: 3,
        user: 'Vikram Singh',
        action: 'completed',
        target: 'Wave Optics Module',
        time: '3 hours ago',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram',
    },
    {
        id: 4,
        user: 'Sneha Reddy',
        action: 'asked a question in',
        target: 'Thermodynamics',
        time: '5 hours ago',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha',
    },
];

// ----- Courses -------------------------------------------------
export const teacherCourses = [
    {
        id: 'C01',
        title: 'Advanced Full Stack Development',
        subject: 'Web Development',
        studentsEnrolled: 1,
        materials: ['Architecture_Guide.pdf', 'NodeJS_Best_Practices.pdf', 'React_Hooks.mp4'],
        status: 'Active',
        lastUpdated: '2026-03-06',
        description: 'Master comprehensive development techniques from architecture to deployment.',
    }
];

// ----- Assignments ---------------------------------------------
export const teacherAssignments = [
    {
        id: 'A01',
        title: 'Build a Full Stack Application',
        courseId: 'C01',
        courseName: 'Advanced Full Stack Development',
        deadline: '2026-03-20',
        totalMarks: 50,
        submissions: [
            { studentId: 'S02', studentName: 'Priya Patel', submittedAt: '2026-03-07T14:30:00', status: 'Graded', grade: 48, answer: 'Detailed GitHub repository and hosted link.' }
        ],
    }
];

// ----- Students ------------------------------------------------
export const teacherStudents = [
    {
        id: 'S02',
        name: 'Priya Patel',
        email: 'priya@student.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
        enrolledCourses: ['C01'],
        progress: { C01: 50 },
        joinedDate: '2026-01-12',
    }
];

// ----- Announcements -------------------------------------------
export const initialAnnouncements = [
    {
        id: 'AN01',
        title: 'Mid-Term Exam Schedule Released',
        body: 'The mid-term exams for Physics 101 and Mathematics 101 are scheduled for March 20th. Please prepare accordingly.',
        course: 'All Courses',
        postedAt: '2026-03-01T09:00:00',
        priority: 'High',
    },
    {
        id: 'AN02',
        title: 'Assignment 3 Deadline Extended',
        body: 'The deadline for Newton\'s Laws Assignment has been extended by 2 days. New deadline: March 10th.',
        course: 'Physics 101 — Mechanics',
        postedAt: '2026-03-03T11:30:00',
        priority: 'Medium',
    },
    {
        id: 'AN03',
        title: 'Extra Class on Integration',
        body: 'An extra doubt-clearing session on Integration techniques is scheduled for Saturday, March 8th at 3 PM.',
        course: 'Mathematics 101 — Calculus',
        postedAt: '2026-03-04T08:00:00',
        priority: 'Low',
    },
];
