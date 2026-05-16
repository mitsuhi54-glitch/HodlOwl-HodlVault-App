import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, Twitter, Github, Linkedin } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'DASHBOARD', path: '/dashboard' },
    { name: 'SECURITY', path: '/security' },
    { name: 'FAQ', path: '/faq' },
    { name: 'ABOUT', path: '/about' },
  ];

  return (
    <>
      <div className="fixed top-8 right-8 z-[100] flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-3 bg-[var(--cyber-gray)] neon-border rounded-none text-[var(--text)] transition-all hover:scale-110 active:scale-95"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 bg-[var(--cyber-black)] neon-border rounded-none text-[var(--accent)] transition-all hover:scale-110 active:scale-95"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[90] bg-[var(--cyber-black)] flex flex-col items-center justify-center space-y-8 cyber-grid"
          >
            <nav className="flex flex-col items-center gap-6">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={link.path}
                    className={`font-display text-4xl md:text-6xl font-bold tracking-tighter transition-all hover:text-[var(--accent)] hover:translate-x-4 ${
                      location.pathname === link.path ? 'text-[var(--accent)] neon-text' : 'text-white opacity-50'
                    }`}
                  >
                    <span className="text-sm align-super mr-4 opacity-50">0{i + 1}</span>
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="flex gap-8 mt-12">
              <a href="#" className="text-white opacity-50 hover:opacity-100 transition-opacity"><Twitter size={24} /></a>
              <a href="#" className="text-white opacity-50 hover:opacity-100 transition-opacity"><Github size={24} /></a>
              <a href="#" className="text-white opacity-50 hover:opacity-100 transition-opacity"><Linkedin size={24} /></a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
