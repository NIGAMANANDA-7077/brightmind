import React from 'react';
import { Users, Wallet, Video, Lightbulb, CheckCircle, Twitter, Linkedin, Facebook } from 'lucide-react';
import FAQSection from '../components/FAQSection';
import CTASection from '../components/CTASection';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const About = () => {
    // Refs for scroll animations
    const [heroRef, heroVisible] = useScrollAnimation({ threshold: 0.1, once: true });
    const [statsRef, statsVisible] = useScrollAnimation({ threshold: 0.1, once: true });
    const [valuesRef, valuesVisible] = useScrollAnimation({ threshold: 0.1, once: true });
    const [chooseRef, chooseVisible] = useScrollAnimation({ threshold: 0.1, once: true });
    const [teamRef, teamVisible] = useScrollAnimation({ threshold: 0.1, once: true });

    const stats = [
        { value: "100,000+", label: "Students Enrolled" },
        { value: "5,000+", label: "Five star reviews" },
        { value: "67,000+", label: "Students community" },
        { value: "15,000+", label: "Job placement" },
    ];

    const values = [
        {
            icon: Users,
            title: "Community First",
            desc: "Join a vibrant community of learners and mentors supporting each other.",
            color: "bg-purple-100 text-purple-600"
        },
        {
            icon: Wallet,
            title: "Cost-effectiveness",
            desc: "Premium Classes at affordable prices, making learning accessible to all.",
            color: "bg-orange-100 text-orange-600"
        },
        {
            icon: Video,
            title: "Course accessibility",
            desc: "Lifetime access to all courses, learn at your own pace from anywhere.",
            color: "bg-teal-100 text-teal-600"
        },
        {
            icon: Lightbulb,
            title: "Personalized learning",
            desc: "Adaptive learning paths tailored to your specific career goals and needs.",
            color: "bg-yellow-100 text-yellow-600"
        }
    ];

    const team = [
        { name: "Marvin McKinney", role: "UX/UI Designer", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80" },
        { name: "Cody Fisher", role: "Web Developer", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80" },
        { name: "Bessie Cooper", role: "Product Manager", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80" },
        { name: "Wade Warren", role: "Digital Marketer", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80" },
        { name: "Ronald Richards", role: "Data Scientist", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80" },
        { name: "Albert Flores", role: "Cyber Security", img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80" },
    ];

    return (
        <div className="pt-20">

            {/* Hero Section */}
            <section className="py-20 bg-white">
                <div className="container-custom text-center">
                    <div
                        ref={heroRef}
                        className={`transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    >
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                            About <span className="text-[#8b5cf6]">BrightMind  Classes</span>
                        </h1>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-12">
                            Empowering learners worldwide directly through quality Classes.
                            We believe in making knowledge accessible, engaging, and practical for everyone.
                        </p>

                        <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl max-w-5xl mx-auto h-[400px] md:h-[500px]">
                            <img
                                src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1600&q=80"
                                alt="Students learning online"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div
                        ref={statsRef}
                        className={`grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-5xl mx-auto stagger-children ${statsVisible ? 'visible' : ''}`}
                    >
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center scroll-slide-up bg-white p-4 rounded-2xl hover:shadow-md transition-all duration-300">
                                <div className="text-3xl md:text-4xl font-bold text-[#8b5cf6] mb-2">{stat.value}</div>
                                <div className="text-gray-500 font-medium text-sm md:text-base">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="py-20 bg-[#fbfbfb]">
                <div className="container-custom">
                    <h2
                        className={`text-center text-4xl font-bold text-gray-900 mb-16 transition-all duration-1000 ${valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    >
                        Our Core <span className="text-[#8b5cf6]">Values</span>
                    </h2>

                    <div
                        ref={valuesRef}
                        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 stagger-children ${valuesVisible ? 'visible' : ''}`}
                    >
                        {values.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <div key={index} className={`p-8 rounded-3xl ${item.color.split(' ')[0]} bg-opacity-50 hover:shadow-lg transition-all duration-300 scroll-slide-up h-full`}>
                                    <div className={`w-12 h-12 rounded-xl ${item.color} bg-opacity-20 flex items-center justify-center mb-6`}>
                                        <Icon className={`w-6 h-6 ${item.color.split(' ')[1]}`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                    <p className="text-gray-600 leading-relaxed text-sm">
                                        {item.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Why Choose Section */}
            <section className="py-20 bg-white">
                <div className="container-custom">
                    <div
                        ref={chooseRef}
                        className="flex flex-col lg:flex-row items-center gap-16"
                    >
                        {/* Left Image */}
                        <div className={`w-full lg:w-1/2 transition-all duration-1000 ${chooseVisible ? 'opacity-100 -translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                            <div className="relative rounded-[2rem] overflow-hidden shadow-xl aspect-square md:aspect-[4/3] group">
                                <img
                                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                                    alt="Student using laptop"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                        </div>

                        {/* Right Content */}
                        <div className={`w-full lg:w-1/2 transition-all duration-1000 delay-300 ${chooseVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                                Why Choose <br />
                                BrightMind  Classes <span className="text-[#8b5cf6]">Training?</span>
                            </h2>
                            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                                Our distinct learning approach sets us apart. We focus on practical skills
                                that employers value. Join our diverse community and start your journey today.
                            </p>

                            <ul className="space-y-4">
                                {[
                                    "Expert-led courses designed for real-world application",
                                    "Flexible learning schedule that fits your life",
                                    "Interactive content to keep you engaged",
                                    "Dedicated support team to help you succeed"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <CheckCircle className="w-6 h-6 text-[#8b5cf6] flex-shrink-0" />
                                        <span className="text-gray-700 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 bg-[#fbfbfb]">
                <div className="container-custom">
                    <h2
                        className={`text-center text-4xl font-bold text-gray-900 mb-16 transition-all duration-1000 ${teamVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    >
                        Meet Our Expert Team
                    </h2>

                    <div
                        ref={teamRef}
                        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children ${teamVisible ? 'visible' : ''}`}
                    >
                        {team.map((member, index) => (
                            <div key={index} className="bg-white rounded-3xl overflow-hidden hover:shadow-xl transition-shadow duration-300 group scroll-slide-up">
                                <div className="h-64 overflow-hidden">
                                    <img
                                        src={member.img}
                                        alt={member.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                                    <p className="text-[#8b5cf6] font-medium mb-4">{member.role}</p>

                                    <div className="flex gap-4">
                                        {[Facebook, Twitter, Linkedin].map((Icon, i) => (
                                            <button key={i} className="text-gray-400 hover:text-[#8b5cf6] transition-colors">
                                                <Icon size={20} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Reuse FAQ & CTA */}
            <FAQSection />
            <CTASection />
        </div>
    );
};

export default About;
