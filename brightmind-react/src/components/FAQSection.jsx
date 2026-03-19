import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div
      className={`rounded-2xl overflow-hidden transition-all duration-300 border theme-border ${
        isOpen
          ? 'bg-[color:var(--bg-secondary)] text-[color:var(--text-primary)] shadow-lg border-[#8b5cf6]/60'
          : 'bg-[color:var(--card-bg)] text-[color:var(--text-primary)] hover:border-[#8b5cf6] hover:shadow-lg'
      }`}
    >
      <button
        onClick={onClick}
        className="w-full px-8 py-6 flex items-center justify-between group text-left"
      >
        <span className="font-bold text-lg md:text-xl">{question}</span>
        <Plus
          className={`w-6 h-6 transition-transform duration-300 flex-shrink-0 ml-4 ${
            isOpen ? 'rotate-45 text-[#8b5cf6]' : 'group-hover:rotate-90 text-[color:var(--text-secondary)]'
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-8 pb-8 text-base md:text-lg leading-relaxed text-[color:var(--text-secondary)] font-medium">
          {answer}
        </div>
      </div>
    </div>
  );
};

import MeshBackground from './MeshBackground';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.1, once: true });

  const faqs = [
    {
      question: "What is BrightMind  Classes?",
      answer: "BrightMind  Classes is an online learning platform offering 500+ hours of expert-led courses across various subjects including Design, Business, Development, and Digital Marketing. We help students enhance their skills and achieve their career goals through innovative teaching methods."
    },
    {
      question: "Who Are The Instructors On BrightMind  Classes?",
      answer: "Our instructors are industry professionals and experts with years of real-world experience. Each instructor is carefully selected based on their expertise, teaching ability, and passion for Classes. They bring practical knowledge and insights to help you succeed."
    },
    {
      question: "Can I Learn At My Own Pace?",
      answer: "Absolutely! All courses on BrightMind  Classes are self-paced, allowing you to learn whenever and wherever you want. You have lifetime access to course materials, so you can revisit lessons and learn at a speed that's comfortable for you."
    },
    {
      question: "How Much Does BrightMind  Classes Cost?",
      answer: "Course prices vary depending on the content and duration, typically ranging from 2500 to 4900. We also offer bundle deals and occasional promotions. Each course is a one-time purchase with lifetime access, providing exceptional value for your investment."
    },
    {
      question: "Is BrightMind  Classes Suitable For Beginners?",
      answer: "Yes! We offer courses for all skill levels, from complete beginners to advanced professionals. Each course clearly indicates its difficulty level, and our instructors structure content to build your knowledge progressively, ensuring you have a solid foundation before moving to advanced topics."
    }
  ];

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <MeshBackground />
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">

          {/* Left Side - Title */}
          <div
            ref={ref}
            className={`lg:col-span-4 lg:sticky lg:top-10 scroll-slide-right ${isVisible ? 'visible' : ''}`}
          >
            <h2 className="text-5xl md:text-6xl font-bold text-[color:var(--text-primary)] leading-tight">
              Frequently Asked Questions
            </h2>
          </div>

          {/* Right Side - Accordion List */}
          <div className="lg:col-span-8 space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
