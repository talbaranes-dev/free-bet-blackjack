import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { useAuthStore } from '../../stores/authStore';
import { getSocket } from '../../services/socket';
import { C2S } from '@shared/events';
import type { PlayerAction } from '@shared/types';
import TableFelt from './TableFelt';
import DealerHand from './DealerHand';
import Hand from './Hand';
import ActionButtons from './ActionButtons';
import BetControls from './BetControls';

// Seat positions matching the SVG bet circles (percentage-based)
const SEAT_POSITIONS = [
  { left: '15%', top: '46%' },   // Position 1 - far left
  { left: '32.5%', top: '36%' }, // Position 2 - left
  { left: '50%', top: '32%' },   // Position 3 - center
  { left: '67.5%', top: '36%' }, // Position 4 - right
  { left: '85%', top: '46%' },   // Position 5 - far right
];

export default function Table() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { seats, gameState, availableActions, mySeatIndex, inviteCode } = useGameStore();
  const mySeat = mySeatIndex !== null ? seats[mySeatIndex] : null;
  const socket = getSocket();

  const takeSeat = useCallback((i: number) => socket.emit(C2S.TAKE_SEAT, { seatIndex: i }), [socket]);
  const placeBet = useCallback((amount: number) => socket.emit(C2S.PLACE_BET, { amount }), [socket]);
  const doAction = useCallback((action: PlayerAction) => socket.emit(C2S.PLAYER_ACTION, { action }), [socket]);
  const readyUp = useCallback(() => socket.emit(C2S.READY_UP), [socket]);

  const isBetting = gameState?.status === 'BETTING';
  const isMyTurn = gameState?.status === 'PLAYER_TURNS' && gameState.currentSeatIndex === mySeatIndex && availableActions;

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#050f08' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 z-20" style={{ background: 'rgba(0,0,0,0.8)' }}>
        <button onClick={() => navigate('/lobby')} className="text-gray-400 text-sm">&larr; Leave</button>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)' }}>
          <span className="text-[10px] text-gray-400">CODE</span>
          <span className="text-sm font-mono font-bold" style={{ color: '#ffd700' }}>{inviteCode}</span>
        </div>
        <div className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)' }}>
          <span className="font-bold text-sm" style={{ color: '#ffd700' }}>{user?.chips?.toLocaleString()}</span>
        </div>
      </div>

      {/* Table area with SVG felt */}
      <div className="flex-1 relative overflow-hidden">
        {/* The detailed SVG table felt */}
        <TableFelt />

        {/* Dealer cards - positioned at top center */}
        <div className="absolute z-10" style={{ top: '18%', left: '50%', transform: 'translateX(-50%)' }}>
          {gameState && gameState.dealerHand.length > 0 ? (
            <DealerHand cards={gameState.dealerHand} value={gameState.dealerValue} />
          ) : null}
        </div>

        {/* Player seat overlays on top of SVG circles */}
        {SEAT_POSITIONS.map((pos, i) => {
          const seat = seats[i];
          const isMe = i === mySeatIndex;
          const isTurn = gameState?.currentSeatIndex === i;

          return (
            <div
              key={i}
              className="absolute z-10 flex flex-col items-center -translate-x-1/2"
              style={{ left: pos.left, top: pos.top }}
            >
              {/* Cards displayed above the circle */}
              {seat && seat.hands.length > 0 && (
                <div className={`mb-1 ${isMe ? '' : 'scale-75'}`}>
                  <Hand hand={seat.hands[0]} small={!isMe} />
                  {/* Hand value badge */}
                  <div className="flex justify-center mt-0.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ background: 'rgba(0,0,0,0.7)', color: 'white' }}>
                      {seat.hands[0].cards.reduce((sum, c) => {
                        if (!c.faceUp) return sum;
                        let v = c.rank === 'A' ? 11 : ['K', 'Q', 'J'].includes(c.rank) ? 10 : parseInt(c.rank);
                        return sum + v;
                      }, 0)}
                    </span>
                    {seat.hands[0].status === 'BUSTED' && <span className="ml-1 text-xs font-bold text-red-400">BUST</span>}
                    {seat.hands[0].status === 'BLACKJACK' && <span className="ml-1 text-xs font-bold text-yellow-400">BJ!</span>}
                  </div>
                </div>
              )}

              {/* Clickable circle area */}
              <motion.div
                onClick={() => !seat && takeSeat(i)}
                className="flex items-center justify-center cursor-pointer"
                style={{ width: '60px', height: '60px', borderRadius: '50%' }}
                animate={isTurn ? { boxShadow: ['0 0 5px #ffd700', '0 0 20px #ffd700', '0 0 5px #ffd700'] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {seat ? (
                  <div className="flex flex-col items-center">
                    {/* Chip stack */}
                    {seat.currentBet > 0 && (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[10px]"
                        style={{
                          background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                          border: '3px solid white',
                          color: 'white',
                          boxShadow: '0 3px 8px rgba(0,0,0,0.5)',
                        }}>
                        {seat.currentBet}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-xl" style={{ color: 'rgba(201,168,76,0.3)' }}>+</span>
                )}
              </motion.div>

              {/* Player name */}
              {seat && (
                <p className="text-[10px] font-bold mt-0.5 px-2 py-0.5 rounded"
                  style={{
                    color: isMe ? '#ffd700' : 'rgba(255,255,255,0.7)',
                    background: 'rgba(0,0,0,0.5)',
                  }}>
                  {isMe ? 'YOU' : seat.username}
                </p>
              )}

              {/* Result overlay */}
              {seat && seat.hands[0]?.result && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{
                    background: seat.hands[0].result === 'WIN' || seat.hands[0].result === 'BLACKJACK_WIN' ? 'rgba(0,230,118,0.3)' :
                      seat.hands[0].result === 'PUSH' ? 'rgba(255,171,64,0.3)' : 'rgba(255,82,82,0.3)',
                    color: seat.hands[0].result === 'WIN' || seat.hands[0].result === 'BLACKJACK_WIN' ? '#00e676' :
                      seat.hands[0].result === 'PUSH' ? '#ffab40' : '#ff5252',
                  }}>
                  {seat.hands[0].result === 'WIN' && `+${seat.hands[0].payout}`}
                  {seat.hands[0].result === 'BLACKJACK_WIN' && `BJ! +${seat.hands[0].payout}`}
                  {seat.hands[0].result === 'PUSH' && 'PUSH'}
                  {seat.hands[0].result === 'LOSS' && `-${seat.hands[0].bet}`}
                </motion.div>
              )}
            </div>
          );
        })}

        {/* "Take a seat" prompt if not seated */}
        {mySeatIndex === null && (
          <div className="absolute z-10" style={{ bottom: '15%', left: '50%', transform: 'translateX(-50%)' }}>
            <p className="text-green-200/40 text-sm text-center">Tap a circle to take a seat</p>
          </div>
        )}

        {/* Ready button if seated but no game */}
        {mySeatIndex !== null && !gameState && (
          <div className="absolute z-10" style={{ bottom: '15%', left: '50%', transform: 'translateX(-50%)' }}>
            {!mySeat?.isReady ? (
              <button onClick={readyUp} className="px-10 py-3 rounded-full font-bold text-black active:scale-95"
                style={{ background: 'linear-gradient(135deg, #ffd700, #ffb300)', boxShadow: '0 4px 15px rgba(255,215,0,0.4)' }}>
                Ready!
              </button>
            ) : (
              <p className="text-green-200/40 text-sm animate-pulse">Waiting for others...</p>
            )}
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="flex-shrink-0 z-20" style={{ background: 'rgba(5,15,8,0.95)' }}>
        {isMyTurn && availableActions ? (
          <ActionButtons actions={availableActions} timeRemaining={gameState?.timeRemaining || 20} onAction={doAction} />
        ) : isBetting && mySeatIndex !== null ? (
          <BetControls minBet={10} maxBet={500} chips={user?.chips || 0} onPlaceBet={placeBet} />
        ) : null}
      </div>
    </div>
  );
}
