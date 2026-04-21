import React from 'react';
import Hero from '../components/Hero';
import BentoGrid from '../components/BentoGrid';

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
            <BentoGrid />

            {/* <PartnersSection /> */}
            <CoursesSection />
            <StatsSection />
            <TestimonialsSection />
            <FAQSection />
            <CTASection />
        </>
    );
};

export default Home;
