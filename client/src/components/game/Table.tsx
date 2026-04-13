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

// Seat positions (percentages) — match the SVG bet circles in TableFelt.
// SVG bet spots are at: (130,360) (270,305) (400,285) (530,305) (670,360)
// Percent of viewBox 800x600.
const SEAT_POSITIONS = [
  { left: '16.25%', top: '60%' },
  { left: '33.75%', top: '50.8%' },
  { left: '50%', top: '47.5%' },
  { left: '66.25%', top: '50.8%' },
  { left: '83.75%', top: '60%' },
];

export default function Table() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { seats, gameState, availableActions, mySeatIndex, inviteCode } = useGameStore();
  const mySeat = mySeatIndex !== null ? seats[mySeatIndex] : null;
  const socket = getSocket();

  const takeSeat = useCallback(
    (i: number) => socket.emit(C2S.TAKE_SEAT, { seatIndex: i }),
    [socket],
  );
  const placeBet = useCallback(
    (amount: number) => socket.emit(C2S.PLACE_BET, { amount }),
    [socket],
  );
  const doAction = useCallback(
    (action: PlayerAction) => socket.emit(C2S.PLAYER_ACTION, { action }),
    [socket],
  );
  const readyUp = useCallback(() => socket.emit(C2S.READY_UP), [socket]);

  const isBetting = gameState?.status === 'BETTING';
  const isMyTurn =
    gameState?.status === 'PLAYER_TURNS' &&
    gameState.currentSeatIndex === mySeatIndex &&
    availableActions;

  return (
    <div
      className="h-full w-full flex flex-col overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at center top, #131c30 0%, #0a0f1c 55%, #05080f 100%)',
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-2 z-20"
        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
      >
        <button
          onClick={() => navigate('/lobby')}
          className="text-gray-300 text-sm font-medium"
        >
          &larr; Leave
        </button>
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full"
          style={{
            backgroundColor: 'rgba(245,210,122,0.10)',
            border: '1px solid rgba(245,210,122,0.30)',
          }}
        >
          <span className="text-[10px] text-gray-400">CODE</span>
          <span
            className="text-sm font-mono font-bold"
            style={{ color: '#f5d27a' }}
          >
            {inviteCode}
          </span>
        </div>
        <div
          className="flex items-center gap-1 px-3 py-1 rounded-full"
          style={{
            backgroundColor: 'rgba(245,210,122,0.10)',
            border: '1px solid rgba(245,210,122,0.30)',
          }}
        >
          <span className="font-bold text-sm" style={{ color: '#f5d27a' }}>
            ${user?.chips?.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Table area with perspective tilt */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 felt-perspective">
          <TableFelt />
        </div>

        {/* Dealer cards - top center */}
        <div
          className="absolute z-10"
          style={{ top: '14%', left: '50%', transform: 'translateX(-50%)' }}
        >
          {gameState && gameState.dealerHand.length > 0 ? (
            <DealerHand cards={gameState.dealerHand} value={gameState.dealerValue} />
          ) : null}
        </div>

        {/* Player seats overlay */}
        {SEAT_POSITIONS.map((pos, i) => {
          const seat = seats[i];
          const isMe = i === mySeatIndex;
          const isTurn = gameState?.currentSeatIndex === i;

          return (
            <div
              key={i}
              className="absolute z-10 flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
              style={{ left: pos.left, top: pos.top }}
            >
              {/* Cards above the avatar */}
              {seat && seat.hands.length > 0 && (
                <div className={`mb-1 ${isMe ? '' : 'scale-90'}`}>
                  <Hand hand={seat.hands[0]} small={!isMe} />
                </div>
              )}

              {/* Avatar / take-seat button */}
              <motion.div
                onClick={() => !seat && takeSeat(i)}
                className="flex items-center justify-center cursor-pointer"
                animate={
                  isTurn
                    ? {
                        boxShadow: [
                          '0 0 0 2px rgba(245,210,122,0.4), 0 0 18px rgba(245,210,122,0.5)',
                          '0 0 0 2px rgba(245,210,122,0.9), 0 0 28px rgba(245,210,122,0.9)',
                          '0 0 0 2px rgba(245,210,122,0.4), 0 0 18px rgba(245,210,122,0.5)',
                        ],
                      }
                    : {}
                }
                transition={{ duration: 1.4, repeat: Infinity }}
                style={{
                  width: seat ? 48 : 52,
                  height: seat ? 48 : 52,
                  borderRadius: '50%',
                  background: seat
                    ? isMe
                      ? 'linear-gradient(135deg, #f5d27a, #c47a12)'
                      : 'linear-gradient(135deg, #2b3a52, #14202f)'
                    : 'rgba(0,0,0,0.3)',
                  border: seat
                    ? '2px solid rgba(245,210,122,0.65)'
                    : '2px dashed rgba(245,210,122,0.4)',
                  boxShadow: seat
                    ? '0 6px 14px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.15)'
                    : 'none',
                  color: seat && isMe ? '#1a1306' : '#f5d27a',
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                {seat ? (
                  seat.username.charAt(0).toUpperCase()
                ) : (
                  <span className="text-2xl">+</span>
                )}
              </motion.div>

              {/* Name */}
              {seat && (
                <p
                  className="mt-1 text-[11px] font-bold text-center max-w-[90px] truncate"
                  style={{
                    color: isMe ? '#f5d27a' : 'rgba(255,255,255,0.95)',
                    textShadow: '0 1px 3px rgba(0,0,0,0.85)',
                  }}
                >
                  {isMe ? 'YOU' : seat.username}
                </p>
              )}

              {/* Chip count */}
              {seat && (
                <p
                  className="text-[10px] font-bold"
                  style={{
                    color: '#f5d27a',
                    textShadow: '0 1px 3px rgba(0,0,0,0.85)',
                  }}
                >
                  ${seat.chips?.toLocaleString?.() ?? seat.chips}
                </p>
              )}

              {/* Current bet chip */}
              {seat && seat.currentBet > 0 && (
                <div
                  className="mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-extrabold"
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

              {/* Round result overlay */}
              {seat && seat.hands[0]?.result && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{
                    background:
                      seat.hands[0].result === 'WIN' ||
                      seat.hands[0].result === 'BLACKJACK_WIN'
                        ? 'rgba(0,230,118,0.25)'
                        : seat.hands[0].result === 'PUSH'
                          ? 'rgba(255,171,64,0.25)'
                          : 'rgba(255,82,82,0.25)',
                    color:
                      seat.hands[0].result === 'WIN' ||
                      seat.hands[0].result === 'BLACKJACK_WIN'
                        ? '#00e676'
                        : seat.hands[0].result === 'PUSH'
                          ? '#ffab40'
                          : '#ff5252',
                  }}
                >
                  {seat.hands[0].result === 'WIN' && `+${seat.hands[0].payout}`}
                  {seat.hands[0].result === 'BLACKJACK_WIN' &&
                    `BJ! +${seat.hands[0].payout}`}
                  {seat.hands[0].result === 'PUSH' && 'PUSH'}
                  {seat.hands[0].result === 'LOSS' && `-${seat.hands[0].bet}`}
                </motion.div>
              )}
            </div>
          );
        })}

        {/* Take a seat prompt */}
        {mySeatIndex === null && (
          <div
            className="absolute z-10"
            style={{ bottom: '15%', left: '50%', transform: 'translateX(-50%)' }}
          >
            <p className="text-[#f5d27a]/60 text-sm text-center">
              Tap a seat to join the table
            </p>
          </div>
        )}

        {/* Ready button if seated but no game */}
        {mySeatIndex !== null && !gameState && (
          <div
            className="absolute z-10"
            style={{ bottom: '15%', left: '50%', transform: 'translateX(-50%)' }}
          >
            {!mySeat?.isReady ? (
              <button
                onClick={readyUp}
                className="px-10 py-3 rounded-full font-bold text-black active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #f5d27a, #c47a12)',
                  boxShadow: '0 6px 18px rgba(245,210,122,0.45)',
                }}
              >
                Ready!
              </button>
            ) : (
              <p className="text-[#f5d27a]/60 text-sm animate-pulse">
                Waiting for others...
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div
        className="flex-shrink-0 z-20"
        style={{ background: 'transparent' }}
      >
        {isMyTurn && availableActions ? (
          <ActionButtons
            actions={availableActions}
            timeRemaining={gameState?.timeRemaining || 20}
            onAction={doAction}
          />
        ) : isBetting && mySeatIndex !== null ? (
          <BetControls
            minBet={10}
            maxBet={500}
            chips={user?.chips || 0}
            onPlaceBet={placeBet}
          />
        ) : null}
      </div>
    </div>
  );
}
