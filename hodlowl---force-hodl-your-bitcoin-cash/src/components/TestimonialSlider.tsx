import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'DEGEN_KING',
    role: 'BCH WHALE',
    content: "HodlOwl saved my portfolio. Locked 500 BCH when it was $200 with a target of $1000. No emotional selling, just pure gains.",
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=degen1'
  },
  {
    name: 'SATO_SHE',
    role: 'CRYPTO RESEARCHER',
    content: "The smart contract logic is impeccable. Force-HODLing is the only way to survive the volatility of the matrix.",
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=sato1'
  },
  {
    name: 'CYBER_PUNK_42',
    role: 'TECH ENTHUSIAST',
    content: "The UI alone makes me want to lock more funds. A perfect blend of aesthetics and utility.",
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=punk1'
  }
];

export const TestimonialSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <div className="relative w-full max-w-4xl mx-auto p-8 neon-border bg-[var(--cyber-gray)]">
      <Quote className="absolute -top-6 -left-6 text-[var(--accent)] opacity-50" size={64} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex flex-col md:flex-row items-center gap-8"
        >
          <img 
            src={testimonials[current].avatar} 
            alt={testimonials[current].name} 
            className="w-24 h-24 rounded-none neon-border border-2"
          />
          <div className="text-center md:text-left">
            <p className="text-xl md:text-2xl font-display italic mb-4 leading-relaxed">
              "{testimonials[current].content}"
            </p>
            <h4 className="text-[var(--accent)] font-bold tracking-widest">{testimonials[current].name}</h4>
            <span className="text-xs font-mono opacity-50 uppercase">{testimonials[current].role}</span>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-end gap-2 mt-8">
        <button onClick={prev} className="p-2 border border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[#000] transition-colors">
          <ChevronLeft size={20} />
        </button>
        <button onClick={next} className="p-2 border border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[#000] transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};
