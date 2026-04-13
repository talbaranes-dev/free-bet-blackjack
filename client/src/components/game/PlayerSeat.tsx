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

export default function PlayerSeat({
  seat,
  isCurrentTurn,
  isMe,
  onTakeSeat,
}: PlayerSeatProps) {
  if (!seat) {
    return (
      <button
        onClick={onTakeSeat}
        className="w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center text-xl transition-all active:scale-90"
        style={{
          borderColor: 'rgba(245,210,122,0.35)',
          color: 'rgba(245,210,122,0.55)',
          background: 'rgba(0,0,0,0.25)',
          backdropFilter: 'blur(4px)',
        }}
        aria-label="Take seat"
      >
        +
      </button>
    );
  }

  const initials = seat.username?.charAt(0).toUpperCase() ?? '?';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center"
    >
      {/* Mini hands above (other players only) */}
      {!isMe && seat.hands.length > 0 && (
        <div className="mb-1 flex gap-1">
          {seat.hands.map((hand, i) => (
            <Hand key={hand.id || i} hand={hand} small />
          ))}
        </div>
      )}

      {/* Avatar circle */}
      <motion.div
        animate={
          isCurrentTurn
            ? {
                boxShadow: [
                  '0 0 0 2px rgba(245,210,122,0.4), 0 0 18px rgba(245,210,122,0.5)',
                  '0 0 0 2px rgba(245,210,122,0.9), 0 0 28px rgba(245,210,122,0.85)',
                  '0 0 0 2px rgba(245,210,122,0.4), 0 0 18px rgba(245,210,122,0.5)',
                ],
              }
            : {}
        }
        transition={{ repeat: Infinity, duration: 1.6 }}
        className="rounded-full flex items-center justify-center text-sm font-extrabold"
        style={{
          width: 52,
          height: 52,
          background: isMe
            ? 'linear-gradient(135deg, #f5d27a, #c47a12)'
            : 'linear-gradient(135deg, #2b3a52, #14202f)',
          color: isMe ? '#1a1306' : '#f5d27a',
          border: '2px solid rgba(245,210,122,0.6)',
          boxShadow: '0 6px 14px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18)',
        }}
      >
        {initials}
      </motion.div>

      {/* Name */}
      <p
        className="mt-1 text-[11px] font-semibold truncate max-w-[80px] text-center"
        style={{ color: isMe ? '#f5d27a' : 'rgba(255,255,255,0.92)' }}
      >
        {isMe ? 'You' : seat.username}
      </p>

      {/* Chip count */}
      <p
        className="text-[10px] font-bold"
        style={{ color: '#f5d27a', textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}
      >
        ${seat.chips?.toLocaleString?.() ?? seat.chips}
      </p>

      {/* Bet chip */}
      {seat.currentBet > 0 && (
        <div
          className="mt-1 w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-extrabold"
          style={{
            background: 'linear-gradient(135deg, #e74c3c, #8b1a1f)',
            color: 'white',
            border: '2px solid #f5d27a',
            boxShadow: '0 3px 8px rgba(0,0,0,0.6)',
          }}
        >
          {seat.currentBet}
        </div>
      )}
    </motion.div>
  );
}
