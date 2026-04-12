import { useState } from 'react';
import { motion } from 'framer-motion';

interface BetControlsProps {
  minBet: number;
  maxBet: number;
  chips: number;
  onPlaceBet: (amount: number) => void;
}

const CHIP_VALUES = [10, 25, 50, 100, 250, 500];

const chipStyles: Record<number, { bg: string; border: string; text: string }> = {
  10: { bg: 'linear-gradient(135deg, #4a90d9, #357abd)', border: '#2c6cb0', text: 'white' },
  25: { bg: 'linear-gradient(135deg, #2ecc71, #27ae60)', border: '#1e8449', text: 'white' },
  50: { bg: 'linear-gradient(135deg, #e74c3c, #c0392b)', border: '#a93226', text: 'white' },
  100: { bg: 'linear-gradient(135deg, #2c3e50, #1a252f)', border: '#566573', text: 'white' },
  250: { bg: 'linear-gradient(135deg, #9b59b6, #8e44ad)', border: '#7d3c98', text: 'white' },
  500: { bg: 'linear-gradient(135deg, #ffd700, #ffb300)', border: '#e6a800', text: 'black' },
};

export default function BetControls({ minBet, maxBet, chips, onPlaceBet }: BetControlsProps) {
  const [bet, setBet] = useState(minBet);

  const addChip = (value: number) => {
    setBet((prev) => Math.min(prev + value, maxBet, chips));
  };

  const clearBet = () => setBet(minBet);

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full px-4 pb-5 pt-2"
    >
      {/* Current bet display */}
      <div className="text-center mb-3">
        <span className="text-xs text-gray-400 uppercase tracking-wider">Your Bet</span>
        <div className="flex items-center justify-center gap-1">
          <span className="text-3xl font-bold" style={{ color: '#ffd700' }}>{bet}</span>
          <span className="text-gray-500 text-sm mt-1">chips</span>
        </div>
      </div>

      {/* Chip selector */}
      <div className="flex gap-2 justify-center mb-4">
        {CHIP_VALUES.filter((v) => v <= chips).map((value) => {
          const style = chipStyles[value];
          return (
            <motion.button
              key={value}
              whileTap={{ scale: 0.8, y: -5 }}
              onClick={() => addChip(value)}
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs border-3 shadow-lg relative"
              style={{
                background: style.bg,
                borderColor: style.border,
                color: style.text,
                borderWidth: '3px',
                boxShadow: `0 4px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)`,
              }}
            >
              {/* Chip pattern */}
              <div className="absolute inset-1 rounded-full border border-dashed opacity-30" style={{ borderColor: style.text }} />
              {value}
            </motion.button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={clearBet}
          className="flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          Clear
        </button>
        <button
          onClick={() => onPlaceBet(bet)}
          disabled={bet < minBet || bet > chips}
          className="flex-2 px-8 py-3 rounded-xl font-bold text-sm text-black transition-all active:scale-95 disabled:opacity-40"
          style={{
            background: 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)',
            boxShadow: '0 4px 15px rgba(255,215,0,0.4)',
          }}
        >
          Deal!
        </button>
      </div>
    </motion.div>
  );
}
