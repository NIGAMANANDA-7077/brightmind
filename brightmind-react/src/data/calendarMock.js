
export const calendarEvents = [
    {
        id: 1,
        title: "Advanced React Patterns Live Class",
        date: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
        time: "4:00 PM - 5:30 PM",
        type: "live", // live, assignment, mentor
        description: "Deep dive into Compound Components and Context API.",
        color: "bg-purple-100 text-purple-700 border-purple-200"
    },
    {
        id: 2,
        title: "UI Grid Assignment Due",
        date: new Date(new Date().setDate(new Date().getDate() + 3)), // 3 days from now
        time: "11:59 PM",
        type: "assignment",
        description: "Submit your responsive grid layout project.",
        color: "bg-orange-100 text-orange-700 border-orange-200"
    },
    {
        id: 3,
        title: "Mentor Session with Dr. Emily",
        date: new Date(new Date().setDate(new Date().getDate() - 2)), // 2 days ago
        time: "2:00 PM - 2:45 PM",
        type: "mentor",
        description: "Weekly progress review and code walkthrough.",
        color: "bg-blue-100 text-blue-700 border-blue-200"
    },
    {
        id: 4,
        title: "Javascript Quiz",
        date: new Date(), // Today
        time: "Anytime",
        type: "assignment",
        description: "Test your knowledge of ES6+ features.",
        color: "bg-red-100 text-red-700 border-red-200"
    },
    {
        id: 5,
        title: "Figma Workshop",
        date: new Date(new Date().setDate(new Date().getDate() + 5)),
        time: "10:00 AM - 12:00 PM",
        type: "live",
        description: "Learn auto-layout and component properties.",
        color: "bg-purple-100 text-purple-700 border-purple-200"
    }
];

export const upcomingEvents = calendarEvents.filter(e => new Date(e.date) >= new Date().setHours(0, 0, 0, 0)).sort((a, b) => a.date - b.date);
