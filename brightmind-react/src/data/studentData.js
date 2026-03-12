
import { BookOpen, Clock, Award, Star, Calendar, MessageSquare, CheckCircle, PlayCircle, Video } from 'lucide-react';

export const studentProfile = {
    name: "Nigamananda",
    email: "nigam.studentBrightMind @gmail.com",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    role: "Student",
    id: "STU-2024-001"
};

export const stats = [
    { id: 1, label: "Enrolled Courses", value: 4, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-50" },
    { id: 2, label: "Hours Learned", value: "32h", icon: Clock, color: "text-orange-500", bg: "bg-orange-50" },
    { id: 3, label: "Assignments Done", value: 12, icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
    { id: 4, label: "Today's Classes", value: 2, icon: Video, color: "text-purple-500", bg: "bg-purple-50" },
];

export const upcomingClasses = [
    {
        id: 1,
        title: "Advanced React Patterns",
        instructor: "Sarah Wilson",
        time: "Today, 4:00 PM",
        duration: "1h 30m",
        joinLink: "#"
    },
    {
        id: 2,
        title: "UI/UX Design Principles",
        instructor: "Mike Johnson",
        time: "Tomorrow, 10:00 AM",
        duration: "1h",
        joinLink: "#"
    }
];

export const progressData = [
    { name: 'Mon', hours: 2 },
    { name: 'Tue', hours: 4 },
    { name: 'Wed', hours: 1 },
    { name: 'Thu', hours: 3 },
    { name: 'Fri', hours: 5 },
    { name: 'Sat', hours: 2 },
    { name: 'Sun', hours: 1 },
];

export const notifications = [
    { id: 1, title: "New Assignment Uploaded", message: "React Hooks implementation assignment is due.", time: "2h ago", type: "alert" },
    { id: 2, title: "Class Rescheduled", message: "Web Development 101 moved to Friday.", time: "5h ago", type: "info" },
    { id: 3, title: "Certificate Earned", message: "Congratulations! You completed JS Basics.", time: "1d ago", type: "success" },
];

export const mentor = {
    name: "Dr. Emily Chen",
    role: "Senior React Developer",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    nextSession: "Feb 15, 2:00 PM"
};

export const avatarOptions = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Milo",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sasha",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Toby",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna"
];

export const studentSupport = {
    phone: "+91 1234567890",
    email: "support@brightmind.com"
};
