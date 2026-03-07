export const forumThreads = [
    {
        id: '1',
        title: "How to properly use useEffect dependency array?",
        description: "I'm struggling to understand when to add functions to the dependency array in useEffect. Sometimes it causes infinite loops.",
        courseId: '1', // Advanced React Patterns
        courseName: "Advanced React Patterns",
        tags: ['React', 'Hooks', 'useEffect'],
        upvotes: 15,
        views: 120,
        createdAt: "2 days ago",
        status: "Solved",
        author: {
            name: "Alex Johnson",
            role: "Student",
            avatar: "https://i.pravatar.cc/150?img=11"
        },
        replies: [
            {
                id: 'r1',
                content: "You should include all values from the component scope that change over time and are used by the effect.",
                author: {
                    name: "Sarah Jenks",
                    role: "Mentor",
                    avatar: "https://i.pravatar.cc/150?img=10"
                },
                createdAt: "1 day ago",
                upvotes: 5,
                isAccepted: true
            },
            {
                id: 'r2',
                content: "Also check out the eslint-plugin-react-hooks, it helps a lot!",
                author: {
                    name: "Mike Chen",
                    role: "Student",
                    avatar: "https://i.pravatar.cc/150?img=12"
                },
                createdAt: "1 day ago",
                upvotes: 2,
                isAccepted: false
            }
        ]
    },
    {
        id: '2',
        title: "Best practices for folder structure in large projects",
        description: "What is the recommended folder structure for a scalable React application? I've seen Feature-based vs Type-based.",
        courseId: '1',
        courseName: "Advanced React Patterns",
        tags: ['Architecture', 'Best Practices'],
        upvotes: 24,
        views: 340,
        createdAt: "5 days ago",
        status: "Open",
        author: {
            name: "Emily Davis",
            role: "Student",
            avatar: "https://i.pravatar.cc/150?img=5"
        },
        replies: []
    },
    {
        id: '3',
        title: "Understanding CSS Grid auto-fit vs auto-fill",
        description: "Can someone explain the difference between auto-fit and auto-fill with examples?",
        courseId: '4', // Graphic Design Essentials (or Web Dev)
        courseName: "Full-Stack Web Development",
        tags: ['CSS', 'Layout', 'Grid'],
        upvotes: 8,
        views: 85,
        createdAt: "1 week ago",
        status: "Solved",
        author: {
            name: "John Doe",
            role: "Student",
            avatar: "https://i.pravatar.cc/150?img=3"
        },
        replies: [
            {
                id: 'r3',
                content: "Auto-fill calls for as many columns as possible, even if they are empty. Auto-fit collapses empty ones.",
                author: {
                    name: "Jane Smith",
                    role: "Student",
                    avatar: "https://i.pravatar.cc/150?img=4"
                },
                createdAt: "6 days ago",
                upvotes: 3,
                isAccepted: true
            }
        ]
    }
];
