export const mockSchedules = [
    {
        id: 1,
        examId: 101,
        title: 'Physics Mid-Term',
        course: 'Physics 101',
        batch: 'Batch A',
        date: '2026-02-15',
        time: '10:00',
        duration: 120, // minutes
        status: 'Scheduled'
    },
    {
        id: 2,
        examId: 102,
        title: 'Chemistry Quiz',
        course: 'Chemistry 201',
        batch: 'Batch B',
        date: '2026-02-18',
        time: '14:00',
        duration: 60,
        status: 'Draft'
    },
    {
        id: 3,
        examId: 103,
        title: 'Math Final Mock',
        course: 'JEE Advanced',
        batch: 'Batch A',
        date: '2026-02-20',
        time: '09:00',
        duration: 180,
        status: 'Scheduled'
    }
];

export const mockResults = [
    {
        id: 101,
        examName: 'Physics Mid-Term',
        date: 'Jan 15, 2026',
        attempts: 45,
        avgScore: 78,
        passPercentage: 85,
        status: 'Released',
        topPerformers: [
            { name: 'Rahul Sharma', score: 98 },
            { name: 'Priya Patel', score: 95 },
            { name: 'Amit Kumar', score: 92 }
        ],
        distribution: [
            { range: '0-20', count: 2 },
            { range: '21-40', count: 5 },
            { range: '41-60', count: 8 },
            { range: '61-80', count: 15 },
            { range: '81-100', count: 15 }
        ]
    },
    {
        id: 102,
        examName: 'Chemistry Quiz',
        date: 'Jan 22, 2026',
        attempts: 42,
        avgScore: 65,
        passPercentage: 70,
        status: 'Released',
        topPerformers: [
            { name: 'Sneha Gupta', score: 90 },
            { name: 'Vikram Singh', score: 88 }
        ],
        distribution: [
            { range: '0-40', count: 10 },
            { range: '41-70', count: 20 },
            { range: '71-100', count: 12 }
        ]
    }
];

export const statsOverview = {
    totalAttempts: 1284,
    avgScore: 72.5,
    passPercentage: 82,
    highestScore: 100
};
