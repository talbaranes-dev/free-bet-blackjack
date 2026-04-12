import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../stores/gameStore';
import { useAuthStore } from '../../stores/authStore';
import { getSocket } from '../../services/socket';
import { C2S } from '@shared/events';
import type { PlayerAction } from '@shared/types';
import DealerHand from './DealerHand';
import PlayerSeat from './PlayerSeat';
import Hand from './Hand';
import ActionButtons from './ActionButtons';
import BetControls from './BetControls';

export default function Table() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { seats, gameState, availableActions, mySeatIndex, inviteCode } = useGameStore();
  const mySeat = mySeatIndex !== null ? seats[mySeatIndex] : null;

  const socket = getSocket();

  const takeSeat = useCallback(
    (index: number) => socket.emit(C2S.TAKE_SEAT, { seatIndex: index }),
    [socket]
  );
  const placeBet = useCallback(
    (amount: number) => socket.emit(C2S.PLACE_BET, { amount }),
    [socket]
  );
  const doAction = useCallback(
    (action: PlayerAction) => socket.emit(C2S.PLAYER_ACTION, { action }),
    [socket]
  );
  const readyUp = useCallback(() => socket.emit(C2S.READY_UP), [socket]);

  const isBetting = gameState?.status === 'BETTING';
  const isMyTurn =
    gameState?.status === 'PLAYER_TURNS' &&
    gameState.currentSeatIndex === mySeatIndex &&
    availableActions;

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#0a0a1a' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 z-20 relative"
        style={{ background: 'rgba(0,0,0,0.7)' }}>
        <button onClick={() => navigate('/lobby')} className="text-gray-400 text-sm active:text-white">
          &larr; Leave
        </button>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full"
          style={{ backgroundColor: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)' }}>
          <span className="text-[10px] text-gray-400">CODE</span>
          <span className="text-sm font-mono font-bold" style={{ color: '#ffd700' }}>{inviteCode}</span>
        </div>
        <div className="flex items-center gap-1 px-3 py-1 rounded-full"
          style={{ backgroundColor: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)' }}>
          <span className="font-bold text-sm" style={{ color: '#ffd700' }}>
            {user?.chips?.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Casino Table */}
      <div className="flex-1 relative overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, #1a4a6e 0%, #0f3555 30%, #0a2a44 60%, #061e33 100%)',
        }}>

        {/* Decorative table pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 Q40 15 30 25 Q20 15 30 5Z' fill='%234a8ab5' fill-opacity='0.3'/%3E%3Cpath d='M30 35 Q40 45 30 55 Q20 45 30 35Z' fill='%234a8ab5' fill-opacity='0.3'/%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Gold arc at top - BLACKJACK PAYS */}
        <div className="relative flex justify-center pt-2">
          <div className="relative px-8 py-2 text-center"
            style={{
              background: 'linear-gradient(180deg, #c9a84c 0%, #a07830 50%, #c9a84c 100%)',
              borderRadius: '0 0 120px 120px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
              border: '2px solid #d4af37',
              minWidth: '320px',
            }}>
            <p className="text-[9px] font-bold tracking-wider text-amber-900">BLACKJACK PAYS 2 TO 1</p>
            <p className="text-[8px] text-amber-800 mt-0.5">Must Hit Soft 17 &bull; Dealer 22 Pushes All</p>
            <div className="mt-1 border-t border-amber-700/50 pt-1">
              <p className="text-[10px] font-bold tracking-[0.2em]" style={{ color: '#3a2510' }}>
                &bull; INSURANCE &bull;
              </p>
            </div>
          </div>
        </div>

        {/* Dealer area */}
        <div className="flex justify-center mt-3 mb-2">
          {gameState && gameState.dealerHand.length > 0 ? (
            <DealerHand cards={gameState.dealerHand} value={gameState.dealerValue} />
          ) : (
            <div className="text-blue-300/30 text-xs">DEALER</div>
          )}
        </div>

        {/* Player positions - semicircle layout */}
        <div className="flex justify-center gap-3 px-2 mt-2">
          {seats.map((seat, i) => (
            <div key={i} className="flex flex-col items-center">
              {/* Gold bet box */}
              <div className="relative mb-1"
                style={{
                  width: '60px',
                  height: '40px',
                  background: i === mySeatIndex
                    ? 'linear-gradient(135deg, rgba(255,215,0,0.3), rgba(255,215,0,0.15))'
                    : 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.08))',
                  border: i === mySeatIndex
                    ? '2px solid rgba(255,215,0,0.6)'
                    : '1.5px solid rgba(201,168,76,0.3)',
                  borderRadius: '8px',
                  boxShadow: i === mySeatIndex
                    ? '0 0 15px rgba(255,215,0,0.2)'
                    : '0 2px 5px rgba(0,0,0,0.3)',
                }}>
                {/* Show mini hand in bet box for other players */}
                {seat && i !== mySeatIndex && seat.hands.length > 0 && (
                  <div className="flex justify-center pt-1 scale-75">
                    <Hand hand={seat.hands[0]} small />
                  </div>
                )}
                {/* Chip on bet box */}
                {seat && seat.currentBet > 0 && (
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[7px] font-bold z-10"
                    style={{
                      background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                      border: '2px solid #fff',
                      color: 'white',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.4)',
                    }}>
                    {seat.currentBet}
                  </div>
                )}
              </div>

              {/* Player info or empty seat */}
              {seat ? (
                <PlayerSeat
                  seat={seat}
                  seatIndex={i}
                  isCurrentTurn={gameState?.currentSeatIndex === i}
                  isMe={i === mySeatIndex}
                  onTakeSeat={() => takeSeat(i)}
                />
              ) : (
                <button
                  onClick={() => takeSeat(i)}
                  className="w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center text-lg transition-all active:scale-90"
                  style={{ borderColor: 'rgba(201,168,76,0.3)', color: 'rgba(201,168,76,0.4)' }}>
                  +
                </button>
              )}
            </div>
          ))}
        </div>

        {/* My hand area - large, center */}
        <div className="flex justify-center mt-4">
          {mySeat && mySeat.hands.length > 0 ? (
            <div className="flex flex-col items-center gap-1">
              {mySeat.hands.map((hand, i) => (
                <div key={hand.id || i} className="flex flex-col items-center">
                  <Hand hand={hand} />
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white font-bold text-lg drop-shadow-lg"
                      style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                      {hand.cards.reduce((sum, c) => {
                        if (!c.faceUp) return sum;
                        let v = c.rank === 'A' ? 11 : ['K', 'Q', 'J'].includes(c.rank) ? 10 : parseInt(c.rank);
                        return sum + v;
                      }, 0)}
                    </span>
                    {hand.freeBet && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold animate-pulse"
                        style={{ backgroundColor: '#ffd700', color: '#000', boxShadow: '0 0 10px rgba(255,215,0,0.5)' }}>
                        FREE BET
                      </span>
                    )}
                    {hand.status === 'BUSTED' && <span className="text-sm font-bold text-red-400">BUST</span>}
                    {hand.status === 'BLACKJACK' && (
                      <span className="text-sm font-bold animate-pulse" style={{ color: '#ffd700' }}>BLACKJACK!</span>
                    )}
                    {hand.result === 'WIN' && <span className="text-sm font-bold text-green-400">+{hand.payout}</span>}
                    {hand.result === 'PUSH' && <span className="text-sm font-bold text-amber-400">PUSH</span>}
                    {hand.result === 'LOSS' && <span className="text-sm font-bold text-red-400">-{hand.bet}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : mySeatIndex === null ? (
            <div className="text-center mt-8">
              <p className="text-blue-200/50 text-sm mb-2">Take a seat to play</p>
            </div>
          ) : !gameState ? (
            <div className="text-center mt-6">
              <p className="text-blue-200/50 text-sm mb-3">
                {mySeat?.isReady ? 'Waiting for others...' : 'Ready to play?'}
              </p>
              {!mySeat?.isReady && (
                <button onClick={readyUp}
                  className="px-10 py-3 rounded-full font-bold text-black active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #ffd700, #ffb300)', boxShadow: '0 4px 15px rgba(255,215,0,0.4)' }}>
                  Ready!
                </button>
              )}
            </div>
          ) : null}
        </div>

        {/* FREE BETS Paytable - bottom center */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
          <div className="text-center px-3 py-1.5 rounded-md"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(4px)',
            }}>
            <p className="text-[8px] font-bold tracking-wider text-blue-200/70 mb-0.5">FREE BETS PAYTABLE</p>
            <div className="flex gap-3 text-[7px] text-blue-200/50">
              <span>Hard 9,10,11 = Free Double</span>
              <span>|</span>
              <span>Pairs (not 10s) = Free Split</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="flex-shrink-0 z-20" style={{ background: 'rgba(10,10,26,0.95)' }}>
        {isMyTurn && availableActions ? (
          <ActionButtons actions={availableActions} timeRemaining={gameState?.timeRemaining || 20} onAction={doAction} />
        ) : isBetting && mySeatIndex !== null ? (
          <BetControls minBet={10} maxBet={500} chips={user?.chips || 0} onPlaceBet={placeBet} />
        ) : null}
      </div>
    </div>
  );
}
