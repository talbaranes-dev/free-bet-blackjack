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
        className="w-12 h-12 rounded-full border-2 border-dashed flex items-center justify-center text-lg transition-all active:scale-90"
        style={{ borderColor: 'rgba(255,215,0,0.2)', color: 'rgba(255,215,0,0.3)' }}
      >
        +
      </button>
    );
  }

  return (
    <motion.div
      className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all min-w-[60px]"
      style={isCurrentTurn ? {
        backgroundColor: 'rgba(255,215,0,0.1)',
        boxShadow: '0 0 15px rgba(255,215,0,0.2)',
        border: '1px solid rgba(255,215,0,0.3)',
      } : {}}
      animate={isCurrentTurn ? { scale: [1, 1.03, 1] } : {}}
      transition={{ repeat: Infinity, duration: 1.5 }}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md"
        style={{
          background: isMe
            ? 'linear-gradient(135deg, #ffd700, #ffb300)'
            : 'linear-gradient(135deg, #34495e, #2c3e50)',
          color: isMe ? '#000' : '#fff',
          boxShadow: isCurrentTurn ? '0 0 10px rgba(255,215,0,0.5)' : '0 2px 5px rgba(0,0,0,0.3)',
        }}
      >
        {seat.username.charAt(0).toUpperCase()}
      </div>

      {/* Name */}
      <p className="text-[10px] truncate max-w-[55px]"
        style={{ color: isMe ? '#ffd700' : 'rgba(255,255,255,0.7)' }}>
        {isMe ? 'You' : seat.username}
      </p>

      {/* Mini hands */}
      {!isMe && seat.hands.length > 0 && (
        <div className="flex flex-col gap-0.5">
          {seat.hands.map((hand, i) => (
            <Hand key={hand.id || i} hand={hand} small />
          ))}
        </div>
      )}

      {/* Bet chip */}
      {seat.currentBet > 0 && (
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold mt-0.5"
          style={{ background: 'linear-gradient(135deg, #c41e3a, #a01830)', color: 'white', border: '1px solid #e74c3c' }}>
          {seat.currentBet}
        </div>
      )}
    </motion.div>
  );
}
