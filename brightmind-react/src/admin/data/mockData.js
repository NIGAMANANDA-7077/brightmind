import { Users, BookOpen, GraduationCap, FileText, TrendingUp, AlertCircle } from 'lucide-react';

export const adminStats = [
    {
        id: 1,
        title: 'Total Students',
        value: '12,543',
        change: '+12.5%',
        trend: 'up',
        icon: Users,
        color: 'bg-blue-100 text-blue-600',
    },
    {
        id: 2,
        title: 'Active Courses',
        value: '45',
        change: '+3',
        trend: 'up',
        icon: BookOpen,
        color: 'bg-purple-100 text-purple-600',
    },
    {
        id: 3,
        title: 'Upcoming Exams',
        value: '8',
        change: 'Next: 2 days',
        trend: 'neutral',
        icon: FileText,
        color: 'bg-amber-100 text-amber-600',
    },
    {
        id: 4,
        title: 'Revenue (Monthly)',
        value: '₹8.4L',
        change: '+8.2%',
        trend: 'up',
        icon: TrendingUp,
        color: 'bg-emerald-100 text-emerald-600',
    },
];

export const activityData = [
    { name: 'Jan', students: 4000, revenue: 2400 },
    { name: 'Feb', students: 3000, revenue: 1398 },
    { name: 'Mar', students: 2000, revenue: 9800 },
    { name: 'Apr', students: 2780, revenue: 3908 },
    { name: 'May', students: 1890, revenue: 4800 },
    { name: 'Jun', students: 2390, revenue: 3800 },
    { name: 'Jul', students: 3490, revenue: 4300 },
];

export const recentActivity = [
    {
        id: 1,
        user: 'Rajesh Kumar',
        action: 'Enrolled in',
        target: 'Advanced React Patterns',
        time: '2 mins ago',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    },
    {
        id: 2,
        user: 'Priya Sharma',
        action: 'Submitted assignment',
        target: 'UI/UX Basics',
        time: '15 mins ago',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    },
    {
        id: 3,
        user: 'Amit Patel',
        action: 'Completed exam',
        target: 'Python for Data Science',
        time: '1 hour ago',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
    },
    {
        id: 4,
        user: 'Sneha Gupta',
        action: 'Posted query in',
        target: 'Digital Marketing 101',
        time: '3 hours ago',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    },
];
