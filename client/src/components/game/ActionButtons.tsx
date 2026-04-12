import { motion } from 'framer-motion';
import type { AvailableActions, PlayerAction } from '@shared/types';

interface ActionButtonsProps {
  actions: AvailableActions;
  timeRemaining: number;
  onAction: (action: PlayerAction) => void;
}

const buttonConfig: { action: PlayerAction; label: string; freeKey?: keyof AvailableActions; color: string }[] = [
  { action: 'hit', label: 'HIT', color: '#27ae60' },
  { action: 'stand', label: 'STAND', color: '#e74c3c' },
  { action: 'double', label: 'DOUBLE', freeKey: 'isFreeDOuble', color: '#3498db' },
  { action: 'split', label: 'SPLIT', freeKey: 'isFreeSplit', color: '#9b59b6' },
  { action: 'surrender', label: 'GIVE UP', color: '#7f8c8d' },
];

export default function ActionButtons({ actions, timeRemaining, onAction }: ActionButtonsProps) {
  return (
    <div className="w-full px-4 pb-5 pt-2">
      {/* Timer */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: timeRemaining > 5 ? '#ffd700' : '#ff5252' }}
            initial={{ width: '100%' }}
            animate={{ width: `${(timeRemaining / 20) * 100}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
        <span className="text-xs font-mono w-6" style={{ color: timeRemaining > 5 ? '#ffd700' : '#ff5252' }}>
          {timeRemaining}s
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-center">
        {buttonConfig.map(({ action, label, freeKey, color }) => {
          const enabled = actions[action as keyof AvailableActions];
          const isFree = freeKey && actions[freeKey];

          if (!enabled) return null;

          return (
            <motion.button
              key={action}
              whileTap={{ scale: 0.85 }}
              onClick={() => onAction(action)}
              className="relative px-4 py-3 rounded-xl font-bold text-sm text-white transition-all"
              style={{
                background: isFree
                  ? 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)'
                  : `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
                color: isFree ? '#000' : '#fff',
                boxShadow: isFree
                  ? '0 4px 15px rgba(255,215,0,0.4)'
                  : `0 4px 12px ${color}44`,
              }}
            >
              {label}
              {isFree && (
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute -top-2 -right-2 text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-green-500 text-white"
                  style={{ boxShadow: '0 2px 8px rgba(0,255,0,0.4)' }}
                >
                  FREE
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
