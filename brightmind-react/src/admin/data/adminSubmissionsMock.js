export const mockAdminSubmissions = [
    {
        id: "SUB001",
        examId: "EX001",
        examName: "Mid-Term Assessment",
        studentId: "STU001",
        studentName: "Alex Johnson",
        batch: "Batch A",
        attemptedAt: "2023-10-25 10:30 AM",
        status: "Draft",
        finalScore: 85,
        scores: {
            omr: 42,
            written: 20,
            assignment: 23
        },
        omrData: {
            totalQuestions: 50,
            correct: 42,
            wrong: 8,
            unattempted: 0
        },
        writtenAnswers: [
            { q: 1, question: "Explain the React Component Lifecycle.", answer: "Mounting, Updating, Unmounting...", maxMarks: 10, marks: 8, comment: "Good explanation." },
            { q: 2, question: "What is the Virtual DOM?", answer: "It is a lightweight copy...", maxMarks: 10, marks: 7, comment: "" },
            { q: 3, question: "Difference between State and Props?", answer: "State is mutable...", maxMarks: 5, marks: 5, comment: "Perfect." }
        ],
        assignmentFiles: [
            { name: "Project_Proposal.pdf", size: "2.4 MB" },
            { name: "Architecture_Diagram.png", size: "1.1 MB" }
        ],
        assignmentComments: "Excellent project structure."
    },
    {
        id: "SUB002",
        examId: "EX001",
        examName: "Mid-Term Assessment",
        studentId: "STU002",
        studentName: "Samantha Lee",
        batch: "Batch A",
        attemptedAt: "2023-10-25 11:15 AM",
        status: "Published",
        finalScore: 75,
        scores: {
            omr: 38,
            written: 25,
            assignment: 12
        },
        omrData: {
            totalQuestions: 50,
            correct: 38,
            wrong: 10,
            unattempted: 2
        },
        writtenAnswers: [
            { q: 1, question: "Explain the React Component Lifecycle.", answer: "It has 3 phases...", maxMarks: 10, marks: 9, comment: "" },
            { q: 2, question: "What is the Virtual DOM?", answer: "Virtual representation...", maxMarks: 10, marks: 8, comment: "" },
            { q: 3, question: "Difference between State and Props?", answer: "Props are read-only...", maxMarks: 5, marks: 8, comment: "Wait, marks > max?" }
        ],
        assignmentFiles: [
            { name: "Case_Study.docx", size: "500 KB" }
        ],
        assignmentComments: "Average work."
    },
    {
        id: "SUB003",
        examId: "EX002",
        examName: "Python Basics",
        studentId: "STU003",
        studentName: "Michael Chen",
        batch: "Batch B",
        attemptedAt: "2023-10-26 09:00 AM",
        status: "Draft",
        finalScore: 92,
        scores: {
            omr: 45,
            written: 30, // Max for this exam
            assignment: 17
        },
        omrData: {
            totalQuestions: 50,
            correct: 45,
            wrong: 5,
            unattempted: 0
        },
        writtenAnswers: [], // Pure OMR + Assignment exam maybe?
        assignmentFiles: [
            { name: "Python_Script.py", size: "4 KB" }
        ],
        assignmentComments: "Clean code."
    }
];
