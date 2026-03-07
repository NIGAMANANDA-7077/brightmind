
import { Clock, BookOpen, Award, TrendingUp } from 'lucide-react';

export const analyticsStats = [
    { id: 1, label: "Total Study Hours", value: "124h", change: "+12%", icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
    { id: 2, label: "Courses Completed", value: "4", change: "+1", icon: BookOpen, color: "text-green-500", bg: "bg-green-50" },
    { id: 3, label: "Current Streak", value: "15 Days", change: "Best: 21", icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-50" },
    { id: 4, label: "Certificates", value: "3", change: "New!", icon: Award, color: "text-purple-500", bg: "bg-purple-50" },
];

export const weeklyStudyData = [
    { name: 'Mon', hours: 2.5 },
    { name: 'Tue', hours: 4.0 },
    { name: 'Wed', hours: 3.2 },
    { name: 'Thu', hours: 5.5 },
    { name: 'Fri', hours: 2.0 },
    { name: 'Sat', hours: 6.0 },
    { name: 'Sun', hours: 3.5 },
];

export const courseScores = [
    { name: 'React Basics', score: 92 },
    { name: 'Adv Hooks', score: 85 },
    { name: 'UI Design', score: 78 },
    { name: 'Node.js', score: 88 },
    { name: 'MongoDB', score: 95 },
];

export const skillDistribution = [
    { name: 'Frontend', value: 45, color: '#8b5cf6' },
    { name: 'Backend', value: 30, color: '#f59e0b' },
    { name: 'Design', value: 15, color: '#ec4899' },
    { name: 'DevOps', value: 10, color: '#10b981' },
];

export const skills = [
    { name: "React", progress: 85, color: "#61dafb" },
    { name: "JavaScript", progress: 90, color: "#f7df1e" },
    { name: "Tailwind CSS", progress: 95, color: "#38bdf8" },
    { name: "Node.js", progress: 60, color: "#68a063" },
    { name: "Figma", progress: 40, color: "#f24e1e" },
];

export const recentActivity = [
    { id: 1, text: "Completed lesson 'Custom Hooks'", time: "2 hours ago", type: "lesson" },
    { id: 2, text: "Scored 92% in React Basics Quiz", time: "Yesterday", type: "quiz" },
    { id: 3, text: "Attended 'UI Design' Live Class", time: "2 days ago", type: "live" },
    { id: 4, text: "Earned 'Fast Learner' Badge", time: "3 days ago", type: "achievement" },
];
