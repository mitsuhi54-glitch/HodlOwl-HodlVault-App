import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';
import { Bitcoin } from 'lucide-react';

export const CustomCursor: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const springConfig = { damping: 25, stiffness: 150 };
  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      // Adjusting centering for 24px icon
      cursorX.set(e.clientX - 12);
      cursorY.set(e.clientY - 12);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        ['a', 'button', 'input', 'textarea'].includes(target.tagName.toLowerCase()) ||
        target.closest('button') ||
        target.closest('a')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      <motion.div
        id="custom-cursor"
        style={{
          left: cursorX,
          top: cursorY,
          scale: isHovering ? 1.8 : 1,
          color: isHovering ? 'var(--neon-pink)' : 'var(--accent)',
        }}
      >
        <Bitcoin size={24} strokeWidth={1.5} />
      </motion.div>
      <div
        id="custom-cursor-dot"
        style={{
          left: mousePosition.x - 2,
          top: mousePosition.y - 2,
        }}
      />
    </>
  );
};
