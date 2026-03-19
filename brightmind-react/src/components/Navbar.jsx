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
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 nav-blur ${isScrolled ? 'shadow-md py-3 border-b border-[color:var(--border-color)]' : 'py-4'}`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between">
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
          <div className="hidden lg:flex items-center space-x-10 absolute left-1/2 transform -translate-x-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`font-medium transition-colors duration-200 ${isActive(link.path) ? 'text-[#8b5cf6]' : 'text-gray-900 hover:text-[#8b5cf6]'
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
              className="p-2 rounded-full border border-[color:var(--border-color)] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link to="/login" className="btn-gradient text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm">
              Log In
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-gray-900 hover:text-[#8b5cf6]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-6 border-t border-[color:var(--border-color)] pt-6 bg-white rounded-2xl shadow-xl px-4 absolute top-full left-4 right-4 animate-scale-in">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`font-medium transition-colors duration-200 text-center py-2 ${isActive(link.path) ? 'text-[#8b5cf6]' : 'text-gray-900 hover:text-[#8b5cf6]'
                    }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <button
                onClick={() => { toggleTheme(); }}
                className="w-full flex items-center justify-center gap-2 border border-[color:var(--border-color)] rounded-full py-3 text-sm font-semibold text-gray-700 dark:text-gray-200"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
              <Link to="/login" className="bg-[#8b5cf6] text-white py-3 rounded-full font-semibold w-full text-center" onClick={() => setIsMobileMenuOpen(false)}>
                Log In
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
