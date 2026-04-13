import { motion } from 'framer-motion';
import type { AvailableActions, PlayerAction } from '@shared/types';

interface ActionButtonsProps {
  actions: AvailableActions;
  timeRemaining: number;
  onAction: (action: PlayerAction) => void;
  pending?: boolean;
}

type ButtonDef = {
  action: PlayerAction;
  label: string;
  variant: 'hit' | 'stand' | 'double' | 'split' | 'surrender';
  freeKey?: 'isFreeDouble' | 'isFreeSplit';
};

const BUTTONS: ButtonDef[] = [
  { action: 'split', label: 'SPLIT', variant: 'split', freeKey: 'isFreeSplit' },
  { action: 'stand', label: 'STAND', variant: 'stand' },
  { action: 'hit', label: 'HIT', variant: 'hit' },
  { action: 'double', label: 'DOUBLE', variant: 'double', freeKey: 'isFreeDouble' },
  { action: 'surrender', label: 'GIVE UP', variant: 'surrender' },
];

export default function ActionButtons({
  actions,
  timeRemaining,
  onAction,
  pending = false,
}: ActionButtonsProps) {
  const pct = Math.max(0, Math.min(100, (timeRemaining / 20) * 100));
  const lowTime = timeRemaining <= 5;

  return (
    <div className="w-full px-3 pb-4 pt-2">
      <div
        className="relative mx-auto max-w-3xl rounded-2xl px-3 pt-2 pb-3"
        style={{
          background: 'rgba(15, 24, 38, 0.82)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {/* Countdown bar across the top of the action container */}
        <div
          className="absolute left-3 right-3 top-1 h-1 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: lowTime
                ? 'linear-gradient(90deg, #ff6b6b, #ff5252)'
                : 'linear-gradient(90deg, #f5d27a, #e8c158)',
              boxShadow: lowTime
                ? '0 0 8px rgba(255,82,82,0.6)'
                : '0 0 8px rgba(232,193,88,0.5)',
            }}
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>

        {/* Time label */}
        <div className="flex items-center justify-end pt-1.5 pb-1 pr-1">
          <span
            className="text-[10px] font-mono"
            style={{ color: lowTime ? '#ff8a8a' : 'rgba(245,210,122,0.85)' }}
          >
            {timeRemaining}s
          </span>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-2 justify-center">
          {BUTTONS.map(({ action, label, variant, freeKey }) => {
            const enabled = !!actions[action as keyof AvailableActions];
            const isFree = !!(freeKey && actions[freeKey]);
            const disabled = !enabled || pending;

            return (
              <motion.button
                key={action}
                whileTap={!disabled ? { scale: 0.92 } : undefined}
                onClick={() => !disabled && onAction(action)}
                disabled={disabled}
                aria-label={label}
                aria-disabled={disabled}
                className={`action-pill ${variant} ${isFree ? 'is-free' : ''} flex-1 min-w-0`}
                style={{
                  maxWidth: 130,
                }}
              >
                <span className="truncate">{label}</span>
                {isFree && (
                  <motion.span
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="absolute -top-2 -right-1 text-[8px] px-1.5 py-0.5 rounded-full font-extrabold"
                    style={{
                      background: 'linear-gradient(135deg, #00e676, #00b859)',
                      color: '#04210f',
                      boxShadow: '0 2px 8px rgba(0,230,118,0.45)',
                      letterSpacing: '0.5px',
                    }}
                  >
                    FREE
                  </motion.span>
                )}
              </motion.button>
            );
          })}

          {/* Chat icon */}
          <button
            type="button"
            aria-label="Chat"
            className="ml-1 flex items-center justify-center rounded-full"
            style={{
              width: 40,
              height: 40,
              background: 'linear-gradient(180deg, #1c2738, #0d1421)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 10px rgba(0,0,0,0.5)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-4 4V6a1 1 0 0 1 1-1Z"
                stroke="#f5d27a"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
