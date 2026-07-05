import { type Position } from './position';
import { motion } from 'motion/react';

export function Node({
  value,
  pos,
  highlighted,
  swapping,
}: {
  id: string;
  value: number;
  pos: Position;
  highlighted: boolean;
  swapping: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: 1,
        scale: 1,
        x: pos.x,
        y: pos.y,
      }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`absolute w-11 h-11 rounded-full flex items-center justify-center text-sm font-mono font-bold border-2 transition-colors duration-200 ${
        swapping
          ? 'border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
          : highlighted
            ? 'border-black bg-white text-black dark:border-white dark:bg-black dark:text-white'
            : 'border-gray-300 bg-white text-gray-500 dark:border-gray-700 dark:bg-black dark:text-gray-400'
      }`}
    >
      {value}
    </motion.div>
  );
}
