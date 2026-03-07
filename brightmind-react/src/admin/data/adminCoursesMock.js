export const mockCourses = [
    {
        id: 1,
        title: 'Complete React Developer in 2024 (w/ Redux, Hooks, GraphQL)',
        subtitle: 'Become a Senior React Developer! Build a massive E-commerce app with Redux, Hooks, GraphQL, ContextAPI, Stripe, Firebase.',
        category: 'Development',
        level: 'Advanced',
        price: '4999',
        status: 'Published',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60',
        description: 'This is the most complete React course on the market.',
        students: 1240,
        lastUpdated: '2 days ago',
        modules: [
            {
                id: 'mod_1',
                title: 'Introduction to React',
                lessons: [
                    { id: 'les_1', title: 'What is React?', type: 'video', duration: '10:00' },
                    { id: 'les_2', title: 'Setup Environment', type: 'document', duration: '05:00' }
                ]
            }
        ]
    },
    {
        id: 2,
        title: 'UI/UX Design Masterclass: Design Mobile Apps',
        subtitle: 'Master Mobile App Design using Figma. Design mobile apps for iOS and Android.',
        category: 'Design',
        level: 'Intermediate',
        price: '3499',
        status: 'Draft',
        thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a5638d48?w=800&auto=format&fit=crop&q=60',
        description: 'Learn to design beautiful mobile apps.',
        students: 850,
        lastUpdated: '5 hours ago',
        modules: []
    },
    {
        id: 3,
        title: 'Python for Data Science and Machine Learning',
        subtitle: 'Learn how to use NumPy, Pandas, Seaborn, Matplotlib, Plotly, Scikit-Learn, Machine Learning, Tensorflow, and more!',
        category: 'Data Science',
        level: 'Beginner',
        price: '2999',
        status: 'Published',
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60',
        description: 'Comprehensive guide to Python data science stack.',
        students: 2100,
        lastUpdated: '1 week ago',
        modules: []
    }
];

export const mockMediaAssets = [
    { id: 1, name: 'intro_video.mp4', type: 'video', size: '24 MB', date: '2 days ago' },
    { id: 2, name: 'course_syllabus.pdf', type: 'document', size: '1.2 MB', date: '1 day ago' },
    { id: 3, name: 'react_logo.png', type: 'image', size: '0.5 MB', date: '3 days ago' },
];
