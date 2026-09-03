import React from 'react';
import { motion } from 'motion/react';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.996 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.996 }}
      transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
      className={`w-full min-h-full ${className}`}
    >
      {children}
    </motion.div>
  );
}

