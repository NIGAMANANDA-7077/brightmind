export const mockCourses = [
    {
        id: "1",
        title: "Advanced Full Stack Development",
        instructor: "Ananay Sharma",
        role: "Senior Full Stack Engineer",
        thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80",
        rating: 4.8,
        students: 1,
        duration: "12h 30m",
        totalLessons: 24,
        price: 3999,
        description: "Master comprehensive development techniques from architecture to deployment.",
        whatYouWillLearn: [
            "Advanced Component Composition patterns",
            "Custom Hooks for complex logic reuse",
            "Performance optimization with React.memo",
            "State management patterns",
            "Building robust Express APIs"
        ],
        modules: [
            {
                id: "m1",
                title: "Getting Started",
                lessons: [
                    { id: "l1", title: "Introduction", duration: "10:00", type: "video", isCompleted: true },
                    { id: "l2", title: "Environment Setup", duration: "10:00", type: "reading", isCompleted: false },
                ]
            }
        ]
    }
];
