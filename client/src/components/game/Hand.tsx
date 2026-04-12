import Card from './Card';
import type { GameHand } from '@shared/types';

interface HandProps {
  hand: GameHand;
  small?: boolean;
}

export default function Hand({ hand, small = false }: HandProps) {
  return (
    <div className="flex items-end">
      {hand.cards.map((card, i) => (
        <div key={i} className={i > 0 ? (small ? '-ml-5' : '-ml-8') : ''}>
          <Card card={card} index={i} small={small} />
        </div>
      ))}
    </div>
  );
}
