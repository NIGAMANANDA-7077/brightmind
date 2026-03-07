import React from 'react';
import Hero from '../components/Hero';
import TeachersSection from '../components/TeachersSection';
import PartnersSection from '../components/PartnersSection';
import CategoriesSection from '../components/CategoriesSection';
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
            <CategoriesSection />
            <CoursesSection />
            <StatsSection />
            <TestimonialsSection />
            <FAQSection />
            <CTASection />
        </>
    );
};

export default Home;
