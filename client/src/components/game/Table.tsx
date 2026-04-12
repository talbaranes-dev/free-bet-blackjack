import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../../stores/gameStore';
import { useAuthStore } from '../../stores/authStore';
import { getSocket } from '../../services/socket';
import { C2S } from '@shared/events';
import type { PlayerAction } from '@shared/types';
import DealerHand from './DealerHand';
import Hand from './Hand';
import ActionButtons from './ActionButtons';
import BetControls from './BetControls';

export default function Table() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { seats, gameState, availableActions, mySeatIndex, inviteCode } = useGameStore();
  const mySeat = mySeatIndex !== null ? seats[mySeatIndex] : null;
  const socket = getSocket();

  const takeSeat = useCallback((index: number) => socket.emit(C2S.TAKE_SEAT, { seatIndex: index }), [socket]);
  const placeBet = useCallback((amount: number) => socket.emit(C2S.PLACE_BET, { amount }), [socket]);
  const doAction = useCallback((action: PlayerAction) => socket.emit(C2S.PLAYER_ACTION, { action }), [socket]);
  const readyUp = useCallback(() => socket.emit(C2S.READY_UP), [socket]);

  const isBetting = gameState?.status === 'BETTING';
  const isMyTurn = gameState?.status === 'PLAYER_TURNS' && gameState.currentSeatIndex === mySeatIndex && availableActions;

  // Seat positions in semicircle (bottom half)
  const seatPositions = [
    { left: '8%', top: '52%' },
    { left: '24%', top: '38%' },
    { left: '50%', top: '32%', transform: 'translateX(-50%)' },
    { left: '68%', top: '38%' },
    { left: '84%', top: '52%' },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#061e33' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 z-20" style={{ background: 'rgba(0,0,0,0.6)' }}>
        <button onClick={() => navigate('/lobby')} className="text-gray-400 text-sm">&larr; Leave</button>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)' }}>
          <span className="text-[10px] text-gray-400">CODE</span>
          <span className="text-sm font-mono font-bold" style={{ color: '#ffd700' }}>{inviteCode}</span>
        </div>
        <div className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)' }}>
          <span className="font-bold text-sm" style={{ color: '#ffd700' }}>{user?.chips?.toLocaleString()}</span>
        </div>
      </div>

      {/* Table area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Blue felt background with swirl pattern */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <radialGradient id="feltGrad" cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#1a5a80" />
              <stop offset="40%" stopColor="#124a6e" />
              <stop offset="100%" stopColor="#082a44" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#feltGrad)" />
          {/* Decorative swirls */}
          <g opacity="0.08" fill="none" stroke="#4a9ec5" strokeWidth="2">
            <path d="M 200,300 Q 250,250 300,300 Q 350,350 300,400 Q 250,350 200,300" />
            <path d="M 100,200 Q 150,150 200,200 Q 250,250 200,300 Q 150,250 100,200" />
            <path d="M 350,200 Q 400,150 450,200 Q 500,250 450,300 Q 400,250 350,200" />
            <path d="M 50,400 Q 100,350 150,400 Q 200,450 150,500 Q 100,450 50,400" />
            <path d="M 400,400 Q 450,350 500,400 Q 550,450 500,500 Q 450,450 400,400" />
            <path d="M 150,100 Q 200,50 250,100 Q 300,150 250,200 Q 200,150 150,100" />
            <path d="M 300,100 Q 350,50 400,100 Q 450,150 400,200 Q 350,150 300,100" />
            {/* Heart shapes */}
            <path d="M 80,350 C 80,330 60,310 40,330 C 20,350 40,380 80,400 C 120,380 140,350 120,330 C 100,310 80,330 80,350" />
            <path d="M 480,350 C 480,330 460,310 440,330 C 420,350 440,380 480,400 C 520,380 540,350 520,330 C 500,310 480,330 480,350" />
          </g>
        </svg>

        {/* Gold arc - BLACKJACK PAYS */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10" style={{ width: '85%', maxWidth: '400px' }}>
          <div className="text-center py-3 px-6"
            style={{
              background: 'linear-gradient(180deg, #d4af37 0%, #b8942e 30%, #c9a84c 60%, #d4af37 100%)',
              borderRadius: '0 0 50% 50%',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.4), inset 0 -2px 0 rgba(0,0,0,0.2)',
              border: '3px solid #e6c44d',
              borderTop: 'none',
            }}>
            <p className="text-[10px] font-bold tracking-widest" style={{ color: '#3a2510' }}>
              BLACKJACK PAYS 2 TO 1
            </p>
            <p className="text-[8px] mt-0.5" style={{ color: '#5a4520' }}>
              Must Hit Soft 17 &bull; Dealer 22 Pushes All
            </p>
            <div className="mt-1.5 pt-1.5" style={{ borderTop: '1px solid rgba(90,69,32,0.4)' }}>
              <p className="text-[11px] font-bold tracking-[0.3em]" style={{ color: '#3a2510' }}>
                &bull; INSURANCE &bull;
              </p>
              <p className="text-[8px]" style={{ color: '#5a4520' }}>PAYS 2 TO 1</p>
            </div>
          </div>
        </div>

        {/* Dealer cards - center top */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10">
          {gameState && gameState.dealerHand.length > 0 ? (
            <DealerHand cards={gameState.dealerHand} value={gameState.dealerValue} />
          ) : (
            <div className="text-blue-300/20 text-[10px] tracking-widest uppercase">Dealer</div>
          )}
        </div>

        {/* Player positions - semicircle with gold bet boxes */}
        {seatPositions.map((pos, i) => {
          const seat = seats[i];
          const isMe = i === mySeatIndex;
          const isTurn = gameState?.currentSeatIndex === i;

          return (
            <div
              key={i}
              className="absolute z-10 flex flex-col items-center"
              style={{ left: pos.left, top: pos.top, transform: pos.transform || '' }}
            >
              {/* Cards above bet box */}
              {seat && seat.hands.length > 0 && !isMe && (
                <div className="mb-1 scale-75">
                  <Hand hand={seat.hands[0]} small />
                </div>
              )}

              {/* Gold bet box */}
              <motion.div
                onClick={() => !seat && takeSeat(i)}
                className="relative cursor-pointer"
                animate={isTurn ? { boxShadow: ['0 0 10px rgba(255,215,0,0.3)', '0 0 25px rgba(255,215,0,0.6)', '0 0 10px rgba(255,215,0,0.3)'] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  width: '70px',
                  height: '50px',
                  background: isMe
                    ? 'linear-gradient(135deg, rgba(212,175,55,0.35), rgba(212,175,55,0.15))'
                    : 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.08))',
                  border: isMe ? '2px solid #d4af37' : '2px solid rgba(212,175,55,0.35)',
                  borderRadius: '10px',
                  boxShadow: isTurn
                    ? '0 0 20px rgba(255,215,0,0.5)'
                    : '0 3px 10px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {!seat ? (
                  <span className="text-2xl" style={{ color: 'rgba(212,175,55,0.4)' }}>+</span>
                ) : (
                  <div className="text-center">
                    <p className="text-[9px] font-bold truncate max-w-[60px]"
                      style={{ color: isMe ? '#ffd700' : 'rgba(255,255,255,0.7)' }}>
                      {isMe ? 'YOU' : seat.username}
                    </p>
                    {seat.currentBet > 0 && (
                      <p className="text-[8px]" style={{ color: 'rgba(255,215,0,0.7)' }}>{seat.currentBet}</p>
                    )}
                  </div>
                )}

                {/* Chip on bet box */}
                {seat && seat.currentBet > 0 && (
                  <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full flex items-center justify-center text-[8px] font-bold z-10"
                    style={{
                      background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                      border: '2.5px solid white',
                      color: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    }}>
                    {seat.currentBet}
                  </div>
                )}
              </motion.div>

              {/* Pot of Gold marker */}
              {seat && (
                <div className="mt-1 px-2 py-0.5 rounded text-[7px] font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #8B6914, #6B4F10)',
                    color: '#ffd700',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  }}>
                  FREE BET
                </div>
              )}
            </div>
          );
        })}

        {/* My hand - large, bottom center */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
          {mySeat && mySeat.hands.length > 0 ? (
            <div className="flex flex-col items-center gap-1">
              {mySeat.hands.map((hand, i) => (
                <div key={hand.id || i} className="flex flex-col items-center">
                  <Hand hand={hand} />
                  <div className="flex items-center gap-2 mt-1">
                    <div className="px-3 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.5)' }}>
                      <span className="text-white font-bold text-lg">
                        {hand.cards.reduce((sum, c) => {
                          if (!c.faceUp) return sum;
                          let v = c.rank === 'A' ? 11 : ['K', 'Q', 'J'].includes(c.rank) ? 10 : parseInt(c.rank);
                          return sum + v;
                        }, 0)}
                      </span>
                    </div>
                    {hand.freeBet && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold animate-pulse"
                        style={{ backgroundColor: '#ffd700', color: '#000' }}>FREE BET</span>
                    )}
                    {hand.status === 'BUSTED' && <span className="text-sm font-bold text-red-400">BUST</span>}
                    {hand.status === 'BLACKJACK' && <span className="text-sm font-bold text-yellow-400 animate-pulse">BLACKJACK!</span>}
                    {hand.result === 'WIN' && <span className="text-sm font-bold text-green-400">+{hand.payout}</span>}
                    {hand.result === 'PUSH' && <span className="text-sm font-bold text-amber-400">PUSH</span>}
                    {hand.result === 'LOSS' && <span className="text-sm font-bold text-red-400">-{hand.bet}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : mySeatIndex !== null && !gameState ? (
            <div className="text-center">
              {!mySeat?.isReady ? (
                <button onClick={readyUp} className="px-10 py-3 rounded-full font-bold text-black active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #ffd700, #ffb300)', boxShadow: '0 4px 15px rgba(255,215,0,0.4)' }}>
                  Ready!
                </button>
              ) : (
                <p className="text-blue-200/50 text-sm">Waiting for others...</p>
              )}
            </div>
          ) : null}
        </div>

        {/* FREE BETS Paytable - bottom */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
          <div className="text-center px-4 py-2 rounded-lg"
            style={{
              background: 'rgba(8,42,68,0.9)',
              border: '1.5px solid rgba(212,175,55,0.25)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            }}>
            <p className="text-[9px] font-bold tracking-wider" style={{ color: 'rgba(212,175,55,0.8)' }}>FREE BETS PAYTABLE</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1 text-[8px]" style={{ color: 'rgba(180,210,240,0.5)' }}>
              <span>Hard 9, 10, 11</span><span>Free Double</span>
              <span>Pairs (not 10s)</span><span>Free Split</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="flex-shrink-0 z-20" style={{ background: 'rgba(6,30,51,0.95)' }}>
        {isMyTurn && availableActions ? (
          <ActionButtons actions={availableActions} timeRemaining={gameState?.timeRemaining || 20} onAction={doAction} />
        ) : isBetting && mySeatIndex !== null ? (
          <BetControls minBet={10} maxBet={500} chips={user?.chips || 0} onPlaceBet={placeBet} />
        ) : null}
      </div>
    </div>
  );
}
