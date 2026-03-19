import React from 'react';
import Hero from '../components/Hero';
import TeachersSection from '../components/TeachersSection';
import PartnersSection from '../components/PartnersSection';
import CoursesSection from '../components/CoursesSection';
import StatsSection from '../components/StatsSection';
import TestimonialsSection from '../components/TestimonialsSection';
import FAQSection from '../components/FAQSection';
import CTASection from '../components/CTASection';

const Home = () => {
    return (
        <>
            <Hero />
            <TeachersSection />
            <PartnersSection />
            <CoursesSection />
            <StatsSection />
            <TestimonialsSection />
            <FAQSection />
            <CTASection />
        </>
    );
};

export default Home;
