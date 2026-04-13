import { motion } from 'framer-motion';
import type { Card as CardType } from '@shared/types';

const suitSymbols: Record<string, string> = {
  hearts: '\u2665',
  diamonds: '\u2666',
  clubs: '\u2663',
  spades: '\u2660',
};

const suitColors: Record<string, string> = {
  hearts: '#e74c3c',
  diamonds: '#e74c3c',
  clubs: '#1a1a2e',
  spades: '#1a1a2e',
};

interface CardProps {
  card: CardType;
  index?: number;
  small?: boolean;
}

export default function Card({ card, index = 0, small = false }: CardProps) {
  const w = small ? 'w-[52px] h-[74px]' : 'w-[72px] h-[104px]';
  const fontSize = small ? 'text-xs' : 'text-base';

  if (!card.faceUp) {
    return (
      <motion.div
        initial={{ rotateY: 180, opacity: 0, scale: 0.5 }}
        animate={{ rotateY: 0, opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.15, duration: 0.4, type: 'spring' }}
        className={`${w} rounded-lg flex items-center justify-center border border-yellow-900/40`}
        style={{
          background: 'linear-gradient(135deg, #c41e3a 0%, #8b0000 50%, #c41e3a 100%)',
          boxShadow:
            '0 8px 18px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
        }}
      >
        <div className="w-3/4 h-3/4 rounded-sm border border-yellow-500/30 flex items-center justify-center"
          style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,215,0,0.1) 2px, rgba(255,215,0,0.1) 4px)' }}
        >
          <span className="text-yellow-500/50 text-lg font-bold">BJ</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ rotateY: 180, opacity: 0, y: -30, scale: 0.5 }}
      animate={{ rotateY: 0, opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.15, duration: 0.4, type: 'spring' }}
      className={`${w} rounded-lg flex flex-col relative overflow-hidden`}
      style={{
        background: 'linear-gradient(145deg, #ffffff 0%, #ececec 100%)',
        boxShadow:
          '0 10px 22px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.95)',
      }}
    >
      {/* Top left */}
      <div className={`flex flex-col items-center pt-1 pl-1.5 ${fontSize} leading-none`}>
        <span className="font-black" style={{ color: suitColors[card.suit] }}>{card.rank}</span>
        <span style={{ color: suitColors[card.suit], fontSize: small ? '11px' : '14px' }}>{suitSymbols[card.suit]}</span>
      </div>
      {/* Center suit */}
      <div className="flex-1 flex items-center justify-center">
        <span style={{ color: suitColors[card.suit], fontSize: small ? '26px' : '38px' }}>{suitSymbols[card.suit]}</span>
      </div>
      {/* Bottom right */}
      <div className={`flex flex-col items-center pb-1 pr-1.5 self-end ${fontSize} leading-none rotate-180`}>
        <span className="font-black" style={{ color: suitColors[card.suit] }}>{card.rank}</span>
        <span style={{ color: suitColors[card.suit], fontSize: small ? '11px' : '14px' }}>{suitSymbols[card.suit]}</span>
      </div>
    </motion.div>
  );
}
