import { motion } from 'framer-motion';
import type { Card as CardType } from '@shared/types';

const suitSymbols: Record<string, string> = {
  hearts: '\u2665',
  diamonds: '\u2666',
  clubs: '\u2663',
  spades: '\u2660',
};

const suitColors: Record<string, string> = {
  hearts: '#ff4444',
  diamonds: '#ff4444',
  clubs: '#ffffff',
  spades: '#ffffff',
};

interface CardProps {
  card: CardType;
  index?: number;
  small?: boolean;
}

export default function Card({ card, index = 0, small = false }: CardProps) {
  const size = small ? 'w-10 h-14 text-xs' : 'w-16 h-22 text-sm';

  if (!card.faceUp) {
    return (
      <motion.div
        initial={{ rotateY: 180, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ delay: index * 0.15, duration: 0.3 }}
        className={`${size} rounded-lg flex items-center justify-center shadow-lg border border-white/20`}
        style={{ backgroundColor: '#c41e3a' }}
      >
        <div className="w-3/4 h-3/4 rounded border border-white/30" style={{ backgroundColor: '#a01830' }} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ rotateY: 180, opacity: 0, x: -50 }}
      animate={{ rotateY: 0, opacity: 1, x: 0 }}
      transition={{ delay: index * 0.15, duration: 0.3, type: 'spring' }}
      className={`${size} rounded-lg bg-white shadow-lg flex flex-col items-start p-1 relative`}
    >
      <span className="font-bold leading-none" style={{ color: suitColors[card.suit] }}>
        {card.rank}
      </span>
      <span className="text-xs leading-none" style={{ color: suitColors[card.suit] }}>
        {suitSymbols[card.suit]}
      </span>
      <span
        className="absolute bottom-1 right-1 text-lg"
        style={{ color: suitColors[card.suit] }}
      >
        {suitSymbols[card.suit]}
      </span>
    </motion.div>
  );
}
