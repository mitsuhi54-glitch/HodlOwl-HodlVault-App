import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { CustomCursor } from './CustomCursor';
import { Navbar } from './Navbar';
import { useLocation } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen selection:bg-[var(--accent)] selection:text-[var(--cyber-black)]">
      <div className="scanline" />
      <CustomCursor />
      <Navbar />
      
      <main className="relative pt-20">
        {children}
      </main>

      {/* Back to Top */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 left-8 z-[100] p-3 bg-[var(--cyber-black)] neon-border rounded-none text-[var(--accent)] transition-all duration-300 ${
          showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        } hover:scale-110`}
        aria-label="Back to Top"
      >
        <ArrowUp size={24} />
      </button>

      {/* Sticky CTA */}
      <div className="fixed bottom-8 right-8 z-[80] hidden md:block">
        <button className="bg-[var(--accent)] text-[var(--cyber-black)] font-display font-bold px-8 py-3 rounded-none shadow-[0_0_20px_var(--accent)] hover:scale-105 transition-transform active:scale-95">
          CONNECT WALLET
        </button>
      </div>

      <footer className="py-8 px-8 border-t border-[var(--cyber-gray)] bg-[var(--cyber-black)]">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-gray-500">
          <p>&copy; 2024 HODLOWL. ALL RIGHTS RESERVED. [VER 1.0.4]</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[var(--accent)] transition-colors">TWITTER</a>
            <a href="#" className="hover:text-[var(--accent)] transition-colors">TELEGRAM</a>
            <a href="#" className="hover:text-[var(--accent)] transition-colors">DISCORD</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
