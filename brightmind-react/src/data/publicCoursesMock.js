export const publicCourses = [
    {
        id: "1",
        title: "Complete Web Design Bootcamp: From Figma to Webflow",
        subtitle: "Master the art of web design and build stunning websites without coding.",
        category: "Design",
        level: "Beginner",
        price: 3499,
        rating: 4.8,
        reviewsCount: 420,
        enrolled: 1250,
        thumbnail: "https://images.unsplash.com/photo-1587440871875-191322ee64b0?auto=format&fit=crop&w=800&q=80",
        instructor: {
            name: "Sarah Jenks",
            role: "Senior Product Designer",
            bio: "Sarah is a Senior Product Designer with over 10 years of experience in creating user-centered digital products. She has worked with top tech companies and is passionate about teaching design.",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
            students: "50,000+",
            courses: 12
        },
        description: "This comprehensive bootcamp takes you from zero to hero in web design. You will learn the fundamentals of UI/UX design, how to use Figma for interface design, and how to bring your designs to life using Webflow. No coding required!",
        whatYouWillLearn: [
            "Master Figma for UI/UX Design",
            "Build responsive websites with Webflow",
            "Understand Color Theory and Typography",
            "Create interactive prototypes",
            "Freelancing tips for designers"
        ],
        requirements: [
            "No prior design experience needed",
            "A computer with internet access",
            "Free Figma account"
        ],
        curriculum: [
            {
                title: "Introduction to Web Design",
                duration: "1h 30m",
                lessons: [
                    { title: "What is UI vs UX?", duration: "15:00", isFree: true },
                    { title: "Design Principles", duration: "20:00", isFree: true },
                    { title: "Typography Basics", duration: "25:00", isFree: false }
                ]
            },
            {
                title: "Mastering Figma",
                duration: "3h 45m",
                lessons: [
                    { title: "Figma Interface Tour", duration: "18:00", isFree: false },
                    { title: "Working with Frames & Shapes", duration: "22:00", isFree: false },
                    { title: "Auto Layout Masterclass", duration: "35:00", isFree: false }
                ]
            }
        ],
        reviews: [
            {
                id: 1,
                user: "John Doe",
                avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80",
                rating: 5,
                date: "2 weeks ago",
                comment: "This course is amazing! I learned so much about Figma and Webflow. Highly recommended for beginners."
            },
            {
                id: 2,
                user: "Jane Smith",
                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80",
                rating: 4,
                date: "1 month ago",
                comment: "Great content, but I wish there were more assignments. Overall, very informative."
            }
        ]
    },
    {
        id: "2",
        title: "Full-Stack React & Node.js Developer Guide",
        subtitle: "Build production-ready applications with the MERN stack.",
        category: "Development",
        level: "Intermediate",
        price: 4999,
        rating: 4.9,
        reviewsCount: 850,
        enrolled: 3400,
        thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80",
        instructor: {
            name: "David Chen",
            role: "Full-Stack Engineer",
            bio: "David is a seasoned Full-Stack Engineer who loves building scalable web applications. He specializes in React, Node.js, and Cloud Architecture.",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
            students: "80,000+",
            courses: 8
        },
        description: "Become a Full-Stack Developer by mastering the MERN stack (MongoDB, Express, React, Node.js). This course covers everything from building RESTful APIs to creating dynamic front-end interfaces and deploying to the cloud.",
        whatYouWillLearn: [
            "Build robust REST APIs with Node.js & Express",
            "Master React Hooks and State Management",
            "Database design with MongoDB",
            "Authentication and Security (JWT)",
            "Deployment to Heroku and Vercel"
        ],
        requirements: [
            "Basic understanding of JavaScript",
            "Familiarity with HTML & CSS",
            "Code editor (VS Code recommended)"
        ],
        curriculum: [
            {
                title: "Backend Development with Node.js",
                duration: "4h 20m",
                lessons: [
                    { title: "Node.js Basics", duration: "25:00", isFree: true },
                    { title: "Express Middleware", duration: "30:00", isFree: false },
                    { title: "Connecting to MongoDB", duration: "40:00", isFree: false }
                ]
            },
            {
                title: "React Frontend Masterclass",
                duration: "5h 15m",
                lessons: [
                    { title: "React Components & Props", duration: "28:00", isFree: true },
                    { title: "Hooks Deep Dive", duration: "45:00", isFree: false },
                    { title: "Context API vs Redux", duration: "35:00", isFree: false }
                ]
            }
        ],
        reviews: [
            {
                id: 1,
                user: "Alex Johnson",
                avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
                rating: 5,
                date: "3 weeks ago",
                comment: "The best MERN stack course I've ever taken. David explains complex concepts very clearly."
            }
        ]
    },
    {
        id: "3",
        title: "Digital Marketing Masterclass: SEO, Social Media & More",
        subtitle: "Grow your business with proven digital marketing strategies.",
        category: "Marketing",
        level: "Beginner",
        price: 2499,
        rating: 4.7,
        reviewsCount: 310,
        enrolled: 2100,
        thumbnail: "https://images.unsplash.com/photo-1533750516457-a7f992034fec?auto=format&fit=crop&w=800&q=80",
        instructor: {
            name: "Emily Davis",
            role: "Marketing Strategist",
            bio: "Emily helps businesses grow their online presence through data-driven marketing strategies. She has managed ad budgets of over $1M.",
            avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
            students: "25,000+",
            courses: 5
        },
        description: "Unlock the power of digital marketing. Learn how to optimize websites for SEO, run profitable Facebook Ads, and build an engaging social media presence.",
        whatYouWillLearn: [
            "SEO Audit and Optimization",
            "Facebook & Instagram Ads",
            "Content Marketing Strategy",
            "Google Analytics 4 Mastery",
            "Email Marketing Automation"
        ],
        requirements: [
            "No prior marketing experience needed",
            "A budget for running small ad tests (optional)"
        ],
        curriculum: [
            {
                title: "SEO Fundamentals",
                duration: "2h 10m",
                lessons: [
                    { title: "Keyword Research", duration: "20:00", isFree: true },
                    { title: "On-Page Optimization", duration: "25:00", isFree: false }
                ]
            },
            {
                title: "Social Media Advertising",
                duration: "3h 30m",
                lessons: [
                    { title: "Setting up Facebook Business Manager", duration: "15:00", isFree: false },
                    { title: "Creating High-Converting Ad Creatives", duration: "30:00", isFree: false }
                ]
            }
        ],
        reviews: []
    },
    {
        id: "4",
        title: "Python for Data Science and Machine Learning",
        subtitle: "Learn Python for data science, machine learning, and data visualization.",
        category: "Data Science",
        level: "Intermediate",
        price: 3999,
        rating: 4.9,
        reviewsCount: 520,
        enrolled: 4500,
        thumbnail: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=800&q=80",
        instructor: {
            name: "Michael Chang",
            role: "Data Scientist",
            bio: "Michael is a Data Scientist with a passion for teaching. He has a Master's degree in Computer Science and has worked with Fortune 500 companies.",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
            students: "30,000+",
            courses: 7
        },
        description: "This course will teach you how to use Python for Data Science and Machine Learning. You will learn how to analyze data, create beautiful visualizations, and build powerful machine learning models.",
        whatYouWillLearn: [
            "Python for Data Science",
            "Data Analysis with Pandas",
            "Data Visualization with Matplotlib and Seaborn",
            "Machine Learning with Scikit-Learn",
            "Deep Learning with TensorFlow"
        ],
        requirements: [
            "Basic Python knowledge",
            "High school level math"
        ],
        curriculum: [
            {
                title: "Introduction to Data Science",
                duration: "1h 30m",
                lessons: [
                    { title: "What is Data Science?", duration: "10:00", isFree: true },
                    { title: "Python Review", duration: "20:00", isFree: true }
                ]
            }
        ],
        reviews: []
    },
    {
        id: "5",
        title: "The Ultimate Graphic Design Course",
        subtitle: "Learn Photoshop, Illustrator, and InDesign from scratch.",
        category: "Design",
        level: "Beginner",
        price: 2999,
        rating: 4.6,
        reviewsCount: 210,
        enrolled: 1800,
        thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80",
        instructor: {
            name: "Jessica Lee",
            role: "Graphic Designer",
            bio: "Jessica is a freelance Graphic Designer with a unique style. She loves helping others unlock their creativity.",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
            students: "15,000+",
            courses: 4
        },
        description: "Master the Adobe Creative Cloud tools and become a professional graphic designer. This course covers everything from photo editing to logo design and layout.",
        whatYouWillLearn: [
            "Master Adobe Photoshop",
            "Vector Art with Illustrator",
            "Page Layout with InDesign",
            "Logo Design Principles",
            "Building a Portfolio"
        ],
        requirements: [
            "Adobe Creative Cloud subscription (free trial works)",
            "Computer capable of running Adobe apps"
        ],
        curriculum: [],
        reviews: []
    }
];
