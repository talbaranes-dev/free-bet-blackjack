import { useState } from 'react';
import { motion } from 'framer-motion';

interface BetControlsProps {
  minBet: number;
  maxBet: number;
  chips: number;
  onPlaceBet: (amount: number) => void;
}

const CHIP_VALUES = [10, 25, 50, 100, 250, 500];

const chipColors: Record<number, string> = {
  10: '#4a90d9',
  25: '#2ecc71',
  50: '#e74c3c',
  100: '#1a1a2e',
  250: '#9b59b6',
  500: '#ffd700',
};

export default function BetControls({ minBet, maxBet, chips, onPlaceBet }: BetControlsProps) {
  const [bet, setBet] = useState(minBet);

  const addChip = (value: number) => {
    setBet((prev) => Math.min(prev + value, maxBet, chips));
  };

  const clearBet = () => setBet(minBet);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full px-4 pb-4"
    >
      <p className="text-center text-gray-400 text-sm mb-2">Place your bet</p>

      {/* Current bet display */}
      <div className="text-center mb-4">
        <span className="text-3xl font-bold" style={{ color: '#ffd700' }}>
          {bet}
        </span>
        <span className="text-gray-400 ml-1">chips</span>
      </div>

      {/* Chip selector */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {CHIP_VALUES.filter((v) => v <= chips).map((value) => (
          <motion.button
            key={value}
            whileTap={{ scale: 0.85 }}
            onClick={() => addChip(value)}
            className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xs border-2 border-white/30 shadow-lg"
            style={{ backgroundColor: chipColors[value], color: value === 100 ? '#fff' : value === 500 ? '#000' : '#fff' }}
          >
            {value}
          </motion.button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={clearBet}
          className="flex-1 py-3 rounded-xl bg-white/10 text-white font-bold transition-transform active:scale-95"
        >
          Clear
        </button>
        <button
          onClick={() => onPlaceBet(bet)}
          disabled={bet < minBet || bet > chips}
          className="flex-1 py-3 rounded-xl font-bold text-black transition-transform active:scale-95 disabled:opacity-40"
          style={{ backgroundColor: '#ffd700' }}
        >
          Deal!
        </button>
      </div>
    </motion.div>
  );
}
