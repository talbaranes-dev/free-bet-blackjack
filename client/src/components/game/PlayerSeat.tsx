import { motion } from 'framer-motion';
import Hand from './Hand';
import type { PlayerSeat as PlayerSeatType } from '@shared/types';

interface PlayerSeatProps {
  seat: PlayerSeatType | null;
  isCurrentTurn: boolean;
  isMe: boolean;
  seatIndex: number;
  onTakeSeat?: () => void;
}

export default function PlayerSeat({ seat, isCurrentTurn, isMe, seatIndex, onTakeSeat }: PlayerSeatProps) {
  if (!seat) {
    return (
      <button
        onClick={onTakeSeat}
        className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-white/30 text-2xl transition-colors hover:border-white/40"
      >
        +
      </button>
    );
  }

  return (
    <motion.div
      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
        isCurrentTurn ? 'bg-amber-500/20 ring-2 ring-amber-400' : ''
      }`}
      animate={isCurrentTurn ? { scale: [1, 1.02, 1] } : {}}
      transition={{ repeat: Infinity, duration: 1.5 }}
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
        style={{ backgroundColor: isMe ? '#ffd700' : 'rgba(255,255,255,0.2)', color: isMe ? '#000' : '#fff' }}
      >
        {seat.username.charAt(0).toUpperCase()}
      </div>

      {/* Name */}
      <p className={`text-xs truncate max-w-[60px] ${isMe ? 'text-amber-400 font-bold' : 'text-gray-300'}`}>
        {isMe ? 'You' : seat.username}
      </p>

      {/* Hands (small for other players) */}
      {!isMe && seat.hands.length > 0 && (
        <div className="flex flex-col gap-1">
          {seat.hands.map((hand, i) => (
            <Hand key={hand.id || i} hand={hand} small />
          ))}
        </div>
      )}

      {/* Bet */}
      {seat.currentBet > 0 && (
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ffd700' }} />
          <span className="text-xs text-gray-300">{seat.currentBet}</span>
        </div>
      )}
    </motion.div>
  );
}
