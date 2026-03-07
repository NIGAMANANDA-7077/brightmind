import { Users, BookOpen, FileText, CheckCircle, Video, Plus, Calendar, Megaphone } from 'lucide-react';

export const stats = {
    students: { value: 2543, title: 'Total Students', change: '+12%', trend: 'up', icon: Users, color: 'bg-purple-100 text-purple-600', link: '/admin/users' },
    courses: { value: 45, title: 'Active Courses', change: '+5%', trend: 'up', icon: BookOpen, color: 'bg-blue-100 text-blue-600', link: '/admin/courses' },
    exams: { value: 12, title: 'Upcoming Exams', change: 'This Week', trend: 'neutral', icon: FileText, color: 'bg-orange-100 text-orange-600', link: '/admin/exams/schedule' },
    submissions: { value: 128, title: 'Pending Submissions', change: '+24', trend: 'down', icon: CheckCircle, color: 'bg-green-100 text-green-600', link: '/admin/results' }
};

export const monthlyActivity = {
    enrollments: [
        { name: 'Jan', value: 400 }, { name: 'Feb', value: 600 }, { name: 'Mar', value: 550 },
        { name: 'Apr', value: 800 }, { name: 'May', value: 950 }, { name: 'Jun', value: 1200 }
    ],
    attempts: [
        { name: 'Jan', value: 200 }, { name: 'Feb', value: 350 }, { name: 'Mar', value: 400 },
        { name: 'Apr', value: 450 }, { name: 'May', value: 600 }, { name: 'Jun', value: 850 }
    ],
    creations: [
        { name: 'Jan', value: 5 }, { name: 'Feb', value: 8 }, { name: 'Mar', value: 4 },
        { name: 'Apr', value: 10 }, { name: 'May', value: 12 }, { name: 'Jun', value: 15 }
    ]
};

export const upcomingExams = [
    { id: 101, title: 'Physics Mid-Term', date: new Date(Date.now() + 86400000).toISOString(), course: 'Physics 101' }, // +1 day
    { id: 102, title: 'Math Final', date: new Date(Date.now() + 172800000).toISOString(), course: 'Math 201' }, // +2 days
    { id: 103, title: 'Chemistry Quiz', date: new Date(Date.now() + 43200000).toISOString(), course: 'Chemistry 101' } // +12 hours
];

export const recentUploads = [
    { id: 1, name: 'Intro_to_Physics.mp4', type: 'Video', size: '450 MB', date: '2 hrs ago' },
    { id: 2, name: 'Lecture_Notes_W2.pdf', type: 'Document', size: '2.4 MB', date: '5 hrs ago' },
    { id: 3, name: 'Lab_Safety_Guidelines.pdf', type: 'Document', size: '1.1 MB', date: '1 day ago' },
    { id: 4, name: 'Organic_Chemistry_P1.mp4', type: 'Video', size: '890 MB', date: '2 days ago' }
];

export const quickActions = [
    { label: 'Create Course', icon: Plus, path: '/admin/courses/create' },
    { label: 'Upload Video', icon: Video, path: '/admin/media' },
    { label: 'Create Exam', icon: FileText, path: '/admin/exams/create' },
    { label: 'Schedule Exam', icon: Calendar, path: '/admin/exams/schedule' },
    { label: 'Announcement', icon: Megaphone, path: '/admin/announcements' }
];

export const activityFeed = [
    { id: 1, user: 'Rahul Sharma', action: 'enrolled in', target: 'Physics 101', time: '10 mins ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul' },
    { id: 2, user: 'Priya Patel', action: 'submitted', target: 'Math Final', time: '45 mins ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' },
    { id: 3, user: 'Admin', action: 'published', target: 'Exam Schedule', time: '2 hours ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin' },
    { id: 4, user: 'Vikram Singh', action: 'updated', target: 'Chemistry Syllabus', time: '5 hours ago', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram' }
];
