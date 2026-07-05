import { motion } from 'motion/react';
import type { Position } from './position';

export function Edge({ from, to }: { from: Position; to: Position }) {
  return (
    <motion.line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke="currentColor"
      strokeWidth={1.5}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.3 }}
      exit={{ pathLength: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
    />
  );
}
