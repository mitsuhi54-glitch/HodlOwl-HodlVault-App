import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const defaultImages = [
  "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=1000"
];

export const HeroSlideshow: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [isManual, setIsManual] = useState(false);

  useEffect(() => {
    if (isManual) {
      const resumeTimer = setTimeout(() => setIsManual(false), 10000); // Resume auto after 10s of no clicks
      return () => clearTimeout(resumeTimer);
    }

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % defaultImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isManual]);

  const handleManualNext = () => {
    setIsManual(true);
    setIndex((prev) => (prev + 1) % defaultImages.length);
  };

  return (
    <div 
      className="relative w-80 h-80 md:w-[500px] md:h-[500px] overflow-hidden neon-border group cursor-pointer"
      onClick={handleManualNext}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={defaultImages[index]}
          alt={`Protocol Slide ${index + 1}`}
          initial={{ opacity: 0, scale: 1.1, filter: 'grayscale(100%) brightness(0.5)' }}
          animate={{ opacity: 1, scale: 1, filter: 'grayscale(50%) brightness(1)' }}
          exit={{ opacity: 0, scale: 0.9, filter: 'grayscale(100%)' }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="w-full h-full object-cover rounded-none grayscale-50 hover:grayscale-0 transition-all duration-700"
        />
      </AnimatePresence>
      
      {/* Decorative Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 font-mono text-[8px] text-[var(--accent)] opacity-50">
          SECURE_VIEWPORT_STREAM_0{index + 1}
        </div>
        <div className="absolute top-4 right-4 font-mono text-[8px] text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">
          [CLICK_TO_ADVANCE]
        </div>
        <div className="absolute bottom-4 right-4 font-mono text-[8px] text-[var(--accent)] opacity-50">
          {isManual ? 'MANUAL_OVERRIDE_ACTIVE' : 'RAW_DATA_INTEL_ACTIVE'}
        </div>
        
        {/* Scanning lines effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />
      </div>

      {/* Frame accents that stay static around the sliding image */}
      <div className="absolute -inset-4 border border-[var(--neon-pink)] opacity-30 animate-pulse pointer-events-none" />
      <div className="absolute -inset-8 border border-[var(--accent)] opacity-10 animate-pulse delay-500 pointer-events-none" />
    </div>
  );
};
