import { motion } from 'framer-motion';
import Card from './Card';
import type { GameHand } from '@shared/types';

interface HandProps {
  hand: GameHand;
  small?: boolean;
  showValue?: boolean;
}

function computeVisibleTotal(hand: GameHand): number {
  let total = 0;
  let aces = 0;
  for (const c of hand.cards) {
    if (!c.faceUp) continue;
    if (c.rank === 'A') {
      aces += 1;
      total += 11;
    } else if (['K', 'Q', 'J'].includes(c.rank)) {
      total += 10;
    } else {
      total += parseInt(c.rank, 10);
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
}

export default function Hand({ hand, small = false, showValue = true }: HandProps) {
  const overlap = small ? -20 : -32;
  const total = computeVisibleTotal(hand);
  const busted = hand.status === 'BUSTED';
  const blackjack = hand.status === 'BLACKJACK';

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-end relative">
        {hand.cards.map((card, i) => {
          // Subtle fan: rotate cards slightly outward from center
          const center = (hand.cards.length - 1) / 2;
          const rot = (i - center) * (small ? 3 : 5);
          const yOff = Math.abs(i - center) * (small ? 1 : 2);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: yOff }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 220, damping: 18 }}
              style={{
                marginLeft: i > 0 ? overlap : 0,
                transform: `rotate(${rot}deg)`,
                transformOrigin: 'bottom center',
              }}
            >
              <Card card={card} index={i} small={small} />
            </motion.div>
          );
        })}
      </div>

      {showValue && hand.cards.some((c) => c.faceUp) && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="value-pill mt-1"
          style={{
            background: busted
              ? 'linear-gradient(180deg, #ff7878 0%, #b81d1d 100%)'
              : blackjack
                ? 'linear-gradient(180deg, #f7d36b 0%, #c47a12 100%)'
                : undefined,
            color: busted ? '#1a0606' : undefined,
          }}
        >
          {busted ? 'BUST' : blackjack ? 'BJ' : total}
        </motion.div>
      )}
    </div>
  );
}
