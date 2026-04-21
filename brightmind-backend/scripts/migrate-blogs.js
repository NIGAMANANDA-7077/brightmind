const fs = require('fs');
const path = require('path');
const BlogPost = require('../models/BlogPost');
const sequelize = require('../config/db');

// Because blog.js uses ES6 `export const blogPosts = [...]`, we have to parse it
// The easiest way is just to load it as a string and execute it or use regex.
// Since it's a script we only run once, let's just make it a JSON-like parse.
let blogPosts = [];
try {
  // Hardcode the array directly in the script for the migration just to be safe:
  blogPosts = [
    {
      "slug": "power-of-expert-led-courses",
      "title": "The Power of Expert-Led Courses for Career Growth",
      "excerpt": "Discover how learning from industry experts can fast-track your professional development and open new opportunities.",
      "image": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
      "category": "Marketing",
      "readTime": "10 Min Read",
      "authorName": "Kathryn Murphy",
      "authorAvatar": "https://i.pravatar.cc/150?img=9",
      "content": "<h2>Understanding the Value of Expert Instruction</h2><p>In today's rapidly evolving professional landscape, the gap between theoretical knowledge and practical application can be significant. Expert-led courses bridge this gap by providing insights drawn from real-world experience, failures, and successes. When you learn from someone who has \"been there and done that,\" you're not just memorizing facts; you're absorbing wisdom.</p><h3>Real-World Insights That Make a Difference</h3><p>Textbooks can teach you the principles of marketing or coding, but they rarely cover the nuances of client management, crisis resolution, or the latest industry shifts. Experts bring these intangible lessons into the classroom. For instance, a senior developer can explain not just how to write code, but how to write <em>maintainable</em> code that survives in a large-scale production environment.</p><h3>How Mentorship Enhances Learning Outcomes</h3><p>Beyond the curriculum, expert instructors often serve as mentors. They can provide personalized feedback, career advice, and networking opportunities. This relationship can accelerate your learning curve drastically compared to self-study methods. Validating your skills with a recognized expert builds confidence and credibility in your field.</p><h3>Choosing the Right Course for Your Goals</h3><p>When selecting a course, look for instructors with active practitioner experience. Check their portfolio, recent projects, and peer reviews. A course is an investment in your future self—ensure you're learning from the best relevant sources available.</p><h3>Conclusion: Transforming Potential into Progress</h3><p>Ultimately, expert-led Classes is about fast-tracking your growth. It condenses years of trial and error into structured learning paths. By investing in quality instruction, you are essentially buying speed and certainty in your career progression.</p>"
    },
    {
      "slug": "top-skills-for-success-2025",
      "title": "Top Skills You Need for Success in 2025",
      "excerpt": "A comprehensive guide to the most in-demand skills that employers are looking for in the coming year.",
      "image": "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
      "category": "Design",
      "readTime": "9 Min Read",
      "authorName": "Ralph Edwards",
      "authorAvatar": "https://i.pravatar.cc/150?img=3",
      "content": "<h2>The Evolving Skills Landscape</h2><p>As we approach 2025, the job market is shifting towards a hybrid of technical proficiency and distinct soft skills. Automation and AI are handling routine tasks, making human-centric skills more valuable than ever.</p><h3>Critical Thinking and Problem Solving</h3><p>The ability to analyze complex situations and devise innovative solutions remains a top priority for employers across all sectors.</p><h3>Digital Literacy and AI Fluency</h3><p>Understanding how to leverage AI tools rather than fearing them will be a key differentiator. Proficiency in data analysis and digital collaboration tools is no longer optional.</p>"
    },
    {
      "slug": "flexible-learning-future-Classes",
      "title": "Why Flexible Learning is the Future of Classes",
      "excerpt": "Explore the benefits of self-paced online learning and why it's becoming the preferred choice for professionals.",
      "image": "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
      "category": "Business",
      "readTime": "9 Min Read",
      "authorName": "Cameron Williamson",
      "authorAvatar": "https://i.pravatar.cc/150?img=4",
      "content": "<h2>Adapting to Modern Lifestyles</h2><p>The traditional 9-to-5 classroom model is becoming obsolete for working professionals. Flexible learning allows individuals to upskill without pausing their careers.</p><h3>Brief Bursts of Learning</h3><p>Micro-learning—consuming content in short, focused bursts—fits better with the human attention span and busy schedules.</p>"
    },
    {
      "slug": "online-learning-boost-career",
      "title": "How Online Learning Can Boost Your Career",
      "excerpt": "Real-life success stories of professionals who transformed their careers through online Classes.",
      "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
      "category": "Skill",
      "readTime": "5 Min Read",
      "authorName": "Kristin Watson",
      "authorAvatar": "https://i.pravatar.cc/150?img=5",
      "content": "<h2>From Stagnation to Promotion</h2><p>Online certifications are now widely recognized by major corporations. They demonstrate proactivity and a commitment to self-improvement.</p>"
    },
    {
      "slug": "mastering-new-skills-lifelong-learning",
      "title": "Mastering New Skills: A Guide to Lifelong Learning",
      "excerpt": "Tips and strategies for staying ahead in a rapidly changing job market through continuous learning.",
      "image": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80",
      "category": "Career",
      "readTime": "7 Min Read",
      "authorName": "Guy Hawkins",
      "authorAvatar": "https://i.pravatar.cc/150?img=12",
      "content": "<h2>The Philosophy of Continuous Improvement</h2><p>The concept of \"graduating\" is outdated. In the knowledge economy, learning is a lifelong process. Those who rest on their laurels risk becoming irrelevant.</p>"
    },
    {
      "slug": "brightmind-helps-achieve-goals",
      "title": "How BrightMind Helps You Achieve Your Goals",
      "excerpt": "An inside look at our learning platform and how it allows you to reach your full potential.",
      "image": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80",
      "category": "News",
      "readTime": "5 Min Read",
      "authorName": "Robert Fox",
      "authorAvatar": "https://i.pravatar.cc/150?img=11",
      "content": "<h2>More Than Just Courses</h2><p>BrightMind isn't just a video library; it's a community. Our interactive projects and peer review systems ensure you apply what you learn.</p>"
    }
  ];
} catch (e) {}

const migrateBlogs = async () => {
    try {
        await sequelize.authenticate();
        await BlogPost.sync({ alter: true });
        console.log('✅ Connected & Synced model');

        let injected = 0;
        for (const post of blogPosts) {
            const exists = await BlogPost.findOne({ where: { slug: post.slug } });
            if (!exists) {
                await BlogPost.create({
                    title: post.title,
                    slug: post.slug,
                    excerpt: post.excerpt,
                    content: post.content,
                    image: post.image,
                    category: post.category,
                    readTime: post.readTime,
                    status: 'Published',
                    authorName: post.authorName,
                    authorAvatar: post.authorAvatar
                });
                injected++;
            }
        }
        
        console.log(`✅ Migration complete. Inserted ${injected} old static blog posts into MySQL.`);
        process.exit(0);
    } catch (e) {
        console.error('❌ Migration failed:', e);
        process.exit(1);
    }
};

migrateBlogs();
