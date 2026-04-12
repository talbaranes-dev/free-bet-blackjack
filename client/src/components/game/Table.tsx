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
    (index: number) => {
      socket.emit(C2S.TAKE_SEAT, { seatIndex: index });
    },
    [socket]
  );

  const placeBet = useCallback(
    (amount: number) => {
      socket.emit(C2S.PLACE_BET, { amount });
    },
    [socket]
  );

  const doAction = useCallback(
    (action: PlayerAction) => {
      socket.emit(C2S.PLAYER_ACTION, { action });
    },
    [socket]
  );

  const readyUp = useCallback(() => {
    socket.emit(C2S.READY_UP);
  }, [socket]);

  const isBetting = gameState?.status === 'BETTING';
  const isMyTurn =
    gameState?.status === 'PLAYER_TURNS' &&
    gameState.currentSeatIndex === mySeatIndex &&
    availableActions;

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: '#0f0f23' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/30">
        <button onClick={() => navigate('/lobby')} className="text-gray-400 text-sm">
          &larr; Leave
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Code:</span>
          <span className="text-sm font-mono font-bold text-white">{inviteCode}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-bold" style={{ color: '#ffd700' }}>
            {user?.chips?.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Dealer area */}
      <div className="flex-shrink-0 flex justify-center py-4">
        {gameState && gameState.dealerHand.length > 0 ? (
          <DealerHand cards={gameState.dealerHand} value={gameState.dealerValue} />
        ) : (
          <div className="text-gray-600 text-sm">Waiting for players...</div>
        )}
      </div>

      {/* Other players */}
      <div className="flex justify-center gap-3 px-4 py-2 overflow-x-auto">
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

      {/* Felt divider */}
      <div className="flex-1 flex items-center justify-center rounded-t-3xl mx-2" style={{ backgroundColor: '#1a5c3a' }}>
        {mySeat && mySeat.hands.length > 0 ? (
          <div className="flex flex-col items-center gap-2">
            {mySeat.hands.map((hand, i) => (
              <div key={hand.id || i} className="flex flex-col items-center">
                <Hand hand={hand} />
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-white font-bold text-lg">
                    {/* Calculate display value */}
                    {hand.cards.reduce((sum, c) => {
                      if (!c.faceUp) return sum;
                      const v = c.rank === 'A' ? 11 : ['K', 'Q', 'J'].includes(c.rank) ? 10 : parseInt(c.rank);
                      return sum + v;
                    }, 0)}
                  </span>
                  {hand.freeBet && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: '#ffd700', color: '#000' }}>
                      FREE BET
                    </span>
                  )}
                  {hand.status === 'BUSTED' && (
                    <span className="text-sm font-bold" style={{ color: '#ff5252' }}>BUST</span>
                  )}
                  {hand.status === 'BLACKJACK' && (
                    <span className="text-sm font-bold" style={{ color: '#ffd700' }}>BLACKJACK!</span>
                  )}
                  {hand.result === 'WIN' && (
                    <span className="text-sm font-bold" style={{ color: '#00e676' }}>WIN +{hand.payout}</span>
                  )}
                  {hand.result === 'PUSH' && (
                    <span className="text-sm font-bold" style={{ color: '#ffab40' }}>PUSH</span>
                  )}
                  {hand.result === 'LOSS' && (
                    <span className="text-sm font-bold" style={{ color: '#ff5252' }}>LOSS</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : mySeatIndex === null ? (
          <div className="text-center">
            <p className="text-white/60 mb-3">Take a seat to play</p>
            <div className="flex gap-3 justify-center">
              {seats.map((seat, i) =>
                !seat ? (
                  <button
                    key={i}
                    onClick={() => takeSeat(i)}
                    className="px-4 py-2 rounded-lg border border-white/30 text-white text-sm transition-transform active:scale-95"
                  >
                    Seat {i + 1}
                  </button>
                ) : null
              )}
            </div>
          </div>
        ) : !gameState ? (
          <div className="text-center">
            <p className="text-white/60 mb-3">
              {mySeat?.isReady ? 'Waiting for others...' : 'Ready to play?'}
            </p>
            {!mySeat?.isReady && (
              <button
                onClick={readyUp}
                className="px-8 py-3 rounded-xl font-bold text-black transition-transform active:scale-95"
                style={{ backgroundColor: '#ffd700' }}
              >
                Ready!
              </button>
            )}
          </div>
        ) : (
          <p className="text-white/40">Waiting...</p>
        )}
      </div>

      {/* Bottom controls */}
      <div className="flex-shrink-0" style={{ backgroundColor: '#0f0f23' }}>
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
