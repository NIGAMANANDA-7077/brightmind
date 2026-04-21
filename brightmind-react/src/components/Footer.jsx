import React from 'react';
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const Footer = () => {
  const [ref, isVisible] = useScrollAnimation({ threshold: 0.1, once: true });

  const companyLinks = [
    { name: 'Home', to: '/' },
    { name: 'About Us', to: '/about' },
    { name: 'Courses', to: '/courses' },
    { name: 'Blog', to: '/blog' },
    { name: 'Contact', to: '/contact' },
  ];

  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, href: "#", label: "Facebook" },
    { icon: <Instagram className="w-5 h-5" />, href: "#", label: "Instagram" },
    { icon: <Twitter className="w-5 h-5" />, href: "#", label: "Twitter" },
    { icon: <Linkedin className="w-5 h-5" />, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10 overflow-hidden">
      <div
        ref={ref}
        className={`container-custom transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">

          {/* Brand Column (Left - Wider) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-[#8b5cf6] rounded-xl flex items-center justify-center shadow-lg transform -rotate-3">
                <span className="text-white font-black text-2xl">B</span>
              </div>
              <span className="text-2xl font-black text-gray-900">BrightMIND</span>
            </div>
            <p className="text-gray-500 leading-relaxed text-lg max-w-sm">
              Empower your learning journey with modern design and expert-led online courses today.
            </p>

            {/* Socials */}
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-[#8b5cf6] hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md border border-gray-100"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns (Right) */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-12">

            {/* Company Links */}
            <div>
              <h3 className="text-gray-900 font-bold text-xl mb-8">Company</h3>
              <ul className="space-y-4">
              {companyLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.to}
                      className="text-gray-500 hover:text-[#8b5cf6] transition-colors font-medium flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-gray-900 font-bold text-xl mb-8">Contact</h3>
              <ul className="space-y-6">
                <li>
                  <a
                    href="tel:+917077629919"
                    className="flex items-start gap-4 text-gray-500 hover:text-[#8b5cf6] transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0 group-hover:bg-[#8b5cf6] group-hover:text-white transition-colors duration-300">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="mt-2 text-base font-medium">+91 7077629919</div>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:nigamcut@gmail.com"
                    className="flex items-start gap-4 text-gray-500 hover:text-[#8b5cf6] transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0 group-hover:bg-[#8b5cf6] group-hover:text-white transition-colors duration-300">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="mt-2 text-base font-medium">nigamcut@gmail.com</div>
                  </a>
                </li>
                <li>
                  <div className="flex items-start gap-4 text-gray-500 group">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0 group-hover:bg-[#8b5cf6] group-hover:text-white transition-colors duration-300">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="mt-2 text-base font-medium leading-relaxed">PATIA,INFOCITY</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 font-medium">
            © {new Date().getFullYear()} BrightMIND. All rights reserved.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-gray-400 hover:text-[#8b5cf6] text-sm font-medium transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-[#8b5cf6] text-sm font-medium transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
