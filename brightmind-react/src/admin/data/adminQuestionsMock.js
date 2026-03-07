export const mockQuestions = [
    {
        id: 1,
        text: 'What represents the velocity-time graph of uniform acceleration?',
        type: 'MCQ',
        topic: 'Physics',
        difficulty: 'Easy',
        marks: 1,
        options: ['Straight line', 'Parabola', 'Hyperbola', 'Circle'],
        correctAnswer: 'Straight line',
        lastEdited: '2 days ago'
    },
    {
        id: 2,
        text: 'Explain the Second Law of Thermodynamics.',
        type: 'Written',
        topic: 'Physics',
        difficulty: 'Hard',
        marks: 5,
        options: [],
        correctAnswer: '',
        lastEdited: '1 day ago'
    },
    {
        id: 3,
        text: 'Integral of sin(x) dx is:',
        type: 'MCQ',
        topic: 'Math',
        difficulty: 'Medium',
        marks: 2,
        options: ['cos(x)', '-cos(x)', 'tan(x)', 'sec(x)'],
        correctAnswer: '-cos(x)',
        lastEdited: '4 hours ago'
    },
    {
        id: 4,
        text: 'The chemical formula for Rust is:',
        type: 'MCQ',
        topic: 'Chemistry',
        difficulty: 'Easy',
        marks: 1,
        options: ['Fe2O3', 'FeO', 'Fe3O4', 'FeCO3'],
        correctAnswer: 'Fe2O3',
        lastEdited: 'Just now'
    }
];

export const mockExams = [
    {
        id: 101,
        title: 'Physics Mid-Term',
        course: 'Physics 101',
        timeLimit: 60,
        status: 'Published',
        lastSaved: '2023-11-01T10:00:00Z',
        versions: [
            { version: 1, date: '2023-10-25', changedBy: 'Admin', snapshot: 'Initial Draft' }
        ],
        sections: [
            { id: 's1', name: 'Section A (MCQ)', marksPerQuestion: 1, questions: [1, 4] }
        ]
    }
];
