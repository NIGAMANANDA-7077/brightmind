import React, { useState, useEffect } from 'react';
import { Menu, X, GraduationCap, Sun, Moon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if link is active
  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Courses', path: '/courses' }, // Placeholder routes
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className="fixed top-4 md:top-6 left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none">
      <nav
        className={`relative pointer-events-auto w-full max-w-5xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 dark:border-gray-800 transition-all duration-300 flex items-center justify-between px-6 ${
          isScrolled ? 'py-2' : 'py-3'
        }`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="relative">
            <GraduationCap className="w-8 h-8 text-gray-900 dark:text-gray-100 relative z-10" strokeWidth={1.5} />
            <div className="absolute inset-0 bg-teal-100 rounded-full scale-75 blur-sm opacity-50 -z-10"></div>
          </div>
          <span className="text-2xl font-black tracking-tight">
            <span className="text-gray-900 dark:text-gray-100">Bright</span>
            <span className="text-[#8b5cf6]">MIND</span>
          </span>
        </Link>

        {/* Desktop Navigation - Centered */}
        <div className="hidden lg:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`font-medium transition-colors duration-200 text-[15px] ${isActive(link.path) ? 'text-[#8b5cf6]' : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Link to="/login" className="bg-[#1a1a1a] hover:bg-black dark:bg-white dark:hover:bg-gray-100 dark:text-black text-white px-7 py-2.5 rounded-full font-medium transition-all duration-300 text-sm">
            Log In
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-gray-900 dark:text-white hover:text-[#8b5cf6] p-1"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-2 pb-6 pt-4 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 px-4 absolute top-[calc(100%+10px)] left-0 right-0 animate-scale-in origin-top">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-medium transition-colors duration-200 text-center py-2 ${isActive(link.path) ? 'text-[#8b5cf6]' : 'text-gray-900 dark:text-gray-100 hover:text-[#8b5cf6]'
                  }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <button
              onClick={() => { toggleTheme(); }}
              className="w-full flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 rounded-full py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <Link to="/login" className="bg-[#1a1a1a] dark:bg-white dark:text-black text-white py-3 rounded-full font-semibold w-full text-center" onClick={() => setIsMobileMenuOpen(false)}>
              Log In
            </Link>
          </div>
        </div>
      )}
      </nav>
    </div>
  );
};

export default Navbar;
