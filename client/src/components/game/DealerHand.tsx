import Card from './Card';
import type { Card as CardType, HandValue } from '@shared/types';

interface DealerHandProps {
  cards: CardType[];
  value?: HandValue;
}

export default function DealerHand({ cards, value }: DealerHandProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-gray-400 text-xs uppercase tracking-wide">Dealer</p>
      <div className="flex items-end">
        {cards.map((card, i) => (
          <div key={i} className={i > 0 ? '-ml-8' : ''}>
            <Card card={card} index={i} />
          </div>
        ))}
      </div>
      {value && (
        <p className="text-white font-bold text-lg">
          {value.isBusted ? (
            <span style={{ color: '#ff5252' }}>BUST ({value.best})</span>
          ) : (
            value.best
          )}
        </p>
      )}
    </div>
  );
}
