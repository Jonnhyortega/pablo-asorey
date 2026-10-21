'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number;
  className?: string;
  triggerOnce?: boolean;
}

const DISTANCE = 16;

export default function FadeIn({
  children,
  delay = 0,
  direction = 'up',
  duration = 0.6,
  className = '',
  triggerOnce = true,
}: FadeInProps) {
  const reduce = useReducedMotion();

  const directions = {
    up: { y: DISTANCE, x: 0 },
    down: { y: -DISTANCE, x: 0 },
    left: { x: DISTANCE, y: 0 },
    right: { x: -DISTANCE, y: 0 },
    none: { x: 0, y: 0 },
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...(reduce ? { x: 0, y: 0 } : directions[direction]),
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
      }}
      viewport={{ once: triggerOnce, margin: '-60px' }}
      transition={{
        duration: reduce ? 0.3 : duration,
        delay: reduce ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
