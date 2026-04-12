import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../stores/gameStore';
import { useAuthStore } from '../../stores/authStore';
import { getSocket } from '../../services/socket';
import { C2S } from '@shared/events';
import type { PlayerAction } from '@shared/types';
import Dealer3D from './Dealer3D';
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

  const dealerMessage = !gameState
    ? 'Place your bets!'
    : gameState.status === 'BETTING'
    ? 'Betting...'
    : gameState.status === 'DEALING'
    ? 'Dealing cards...'
    : gameState.status === 'PLAYER_TURNS'
    ? gameState.currentSeatIndex === mySeatIndex
      ? 'Your turn!'
      : 'Waiting...'
    : gameState.status === 'DEALER_TURN'
    ? 'Dealer plays'
    : gameState.status === 'COMPLETE'
    ? 'Round over!'
    : '';

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'linear-gradient(180deg, #0a0a1a 0%, #12122a 100%)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 z-10"
        style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(26,26,46,0.8) 50%, rgba(0,0,0,0.8) 100%)' }}
      >
        <button onClick={() => navigate('/lobby')} className="text-gray-400 text-sm active:text-white">
          &larr; Leave
        </button>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)' }}>
          <span className="text-[10px] text-gray-400">CODE</span>
          <span className="text-sm font-mono font-bold" style={{ color: '#ffd700' }}>{inviteCode}</span>
        </div>
        <div className="flex items-center gap-1 px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)' }}>
          <span className="text-sm">🪙</span>
          <span className="font-bold text-sm" style={{ color: '#ffd700' }}>
            {user?.chips?.toLocaleString()}
          </span>
        </div>
      </div>

      {/* FREE BET BLACKJACK title */}
      <div className="text-center py-1">
        <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: 'rgba(255,215,0,0.5)' }}>
          Free Bet Blackjack
        </span>
      </div>

      {/* Dealer area */}
      <div className="flex-shrink-0 flex flex-col items-center">
        <Dealer3D
          isDealing={gameState?.status === 'DEALING'}
          message={dealerMessage}
        />
        {/* Dealer cards */}
        {gameState && gameState.dealerHand.length > 0 && (
          <div className="mt-2">
            <DealerHand cards={gameState.dealerHand} value={gameState.dealerValue} />
          </div>
        )}
      </div>

      {/* Casino table felt */}
      <div className="flex-1 flex flex-col relative mx-2 rounded-t-[40px] overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, #2d6b3f 0%, #1a4c2c 40%, #0f3520 100%)',
          boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.5), 0 -2px 10px rgba(255,215,0,0.1)',
          borderTop: '3px solid rgba(255,215,0,0.3)',
          borderLeft: '2px solid rgba(255,215,0,0.15)',
          borderRight: '2px solid rgba(255,215,0,0.15)',
        }}
      >
        {/* Table pattern overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        />

        {/* Other players row */}
        <div className="flex justify-center gap-2 px-3 pt-3 pb-1 overflow-x-auto z-10">
          {seats.map((seat, i) => {
            if (i === mySeatIndex) return null;
            return (
              <PlayerSeat
                key={i}
                seat={seat}
                seatIndex={i}
                isCurrentTurn={gameState?.currentSeatIndex === i}
                isMe={false}
                onTakeSeat={() => takeSeat(i)}
              />
            );
          })}
        </div>

        {/* My hand area */}
        <div className="flex-1 flex items-center justify-center z-10">
          {mySeat && mySeat.hands.length > 0 ? (
            <div className="flex flex-col items-center gap-2">
              {mySeat.hands.map((hand, i) => (
                <div key={hand.id || i} className="flex flex-col items-center">
                  <Hand hand={hand} />
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white font-bold text-lg drop-shadow-lg">
                      {hand.cards.reduce((sum, c) => {
                        if (!c.faceUp) return sum;
                        let v = c.rank === 'A' ? 11 : ['K', 'Q', 'J'].includes(c.rank) ? 10 : parseInt(c.rank);
                        return sum + v;
                      }, 0)}
                    </span>
                    {hand.freeBet && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse"
                        style={{ backgroundColor: '#ffd700', color: '#000', boxShadow: '0 0 10px rgba(255,215,0,0.5)' }}>
                        FREE BET
                      </span>
                    )}
                    {hand.status === 'BUSTED' && (
                      <span className="text-sm font-bold px-2 py-0.5 rounded-full bg-red-500/20" style={{ color: '#ff5252' }}>BUST</span>
                    )}
                    {hand.status === 'BLACKJACK' && (
                      <span className="text-sm font-bold px-2 py-0.5 rounded-full animate-pulse"
                        style={{ color: '#ffd700', backgroundColor: 'rgba(255,215,0,0.2)', boxShadow: '0 0 15px rgba(255,215,0,0.3)' }}>
                        BLACKJACK!
                      </span>
                    )}
                    {hand.result === 'WIN' && (
                      <span className="text-sm font-bold" style={{ color: '#00e676' }}>+{hand.payout}</span>
                    )}
                    {hand.result === 'PUSH' && (
                      <span className="text-sm font-bold" style={{ color: '#ffab40' }}>PUSH</span>
                    )}
                    {hand.result === 'LOSS' && (
                      <span className="text-sm font-bold" style={{ color: '#ff5252' }}>-{hand.bet}</span>
                    )}
                  </div>
                </div>
              ))}

              {/* Bet display */}
              {mySeat.currentBet > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-5 h-5 rounded-full border-2 border-yellow-400 flex items-center justify-center text-[8px] font-bold"
                    style={{ backgroundColor: '#c41e3a', color: 'white' }}>
                    $
                  </div>
                  <span className="text-xs text-yellow-400">{mySeat.currentBet}</span>
                </div>
              )}
            </div>
          ) : mySeatIndex === null ? (
            <div className="text-center">
              <p className="text-white/60 mb-4 text-sm">Take a seat to play</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {seats.map((seat, i) =>
                  !seat ? (
                    <button
                      key={i}
                      onClick={() => takeSeat(i)}
                      className="w-12 h-12 rounded-full border-2 border-dashed border-yellow-500/30 text-yellow-500/50 text-xl transition-all active:scale-90 active:border-yellow-400"
                      style={{ boxShadow: '0 0 10px rgba(255,215,0,0.1)' }}
                    >
                      +
                    </button>
                  ) : null
                )}
              </div>
            </div>
          ) : !gameState ? (
            <div className="text-center">
              <p className="text-white/60 mb-3 text-sm">
                {mySeat?.isReady ? 'Waiting for others...' : 'Ready to play?'}
              </p>
              {!mySeat?.isReady && (
                <button
                  onClick={readyUp}
                  className="px-10 py-3 rounded-full font-bold text-black transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #ffd700 0%, #ffb300 100%)',
                    boxShadow: '0 4px 15px rgba(255,215,0,0.4)',
                  }}
                >
                  Ready!
                </button>
              )}
            </div>
          ) : (
            <p className="text-white/30 text-sm">Waiting...</p>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="flex-shrink-0" style={{ background: 'linear-gradient(180deg, rgba(15,15,35,0) 0%, rgba(15,15,35,1) 30%)' }}>
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
