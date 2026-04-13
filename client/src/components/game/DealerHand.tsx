import { motion } from 'framer-motion';
import Card from './Card';
import type { Card as CardType, HandValue } from '@shared/types';

interface DealerHandProps {
  cards: CardType[];
  value?: HandValue;
}

export default function DealerHand({ cards, value }: DealerHandProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <p
        className="text-[10px] uppercase tracking-[0.25em] font-semibold"
        style={{ color: 'rgba(245,210,122,0.85)' }}
      >
        Dealer
      </p>

      <div className="flex items-end relative">
        {cards.map((card, i) => {
          const center = (cards.length - 1) / 2;
          const rot = (i - center) * 5;
          const yOff = Math.abs(i - center) * 2;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: yOff }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 220, damping: 18 }}
              style={{
                marginLeft: i > 0 ? -32 : 0,
                transform: `rotate(${rot}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <Card card={card} index={i} />
            </motion.div>
          );
        })}
      </div>

      {value && (
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          className="value-pill mt-1"
          style={
            value.isBusted
              ? {
                  background: 'linear-gradient(180deg, #ff7878 0%, #b81d1d 100%)',
                  color: '#1a0606',
                }
              : undefined
          }
        >
          {value.isBusted ? `BUST ${value.best}` : value.best}
        </motion.div>
      )}
    </div>
  );
}
