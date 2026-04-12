import { motion } from 'framer-motion';
import type { AvailableActions, PlayerAction } from '@shared/types';

interface ActionButtonsProps {
  actions: AvailableActions;
  timeRemaining: number;
  onAction: (action: PlayerAction) => void;
}

const buttonConfig: { action: PlayerAction; label: string; freeKey?: keyof AvailableActions }[] = [
  { action: 'hit', label: 'HIT' },
  { action: 'stand', label: 'STAND' },
  { action: 'double', label: 'DOUBLE', freeKey: 'isFreeDOuble' },
  { action: 'split', label: 'SPLIT', freeKey: 'isFreeSplit' },
  { action: 'surrender', label: 'SURRENDER' },
];

export default function ActionButtons({ actions, timeRemaining, onAction }: ActionButtonsProps) {
  return (
    <div className="w-full px-4 pb-4">
      {/* Timer */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: timeRemaining > 5 ? '#ffd700' : '#ff5252' }}
            initial={{ width: '100%' }}
            animate={{ width: `${(timeRemaining / 20) * 100}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
        <span className="text-xs text-gray-400 w-6">{timeRemaining}s</span>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        {buttonConfig.map(({ action, label, freeKey }) => {
          const enabled = actions[action as keyof AvailableActions];
          const isFree = freeKey && actions[freeKey];

          if (!enabled) return null;

          return (
            <motion.button
              key={action}
              whileTap={{ scale: 0.9 }}
              onClick={() => onAction(action)}
              className={`px-5 py-3 rounded-xl font-bold text-sm transition-colors relative ${
                isFree
                  ? 'text-black shadow-lg shadow-amber-500/30'
                  : 'bg-white/10 text-white border border-white/20 active:bg-white/20'
              }`}
              style={isFree ? { backgroundColor: '#ffd700' } : undefined}
            >
              {label}
              {isFree && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  FREE
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
