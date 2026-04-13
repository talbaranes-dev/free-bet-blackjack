import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { useAuthStore } from '../stores/authStore';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';
import { S2C, C2S } from '@shared/events';
import type { RoomState, AvailableActions, PlayerSeat } from '@shared/types';
import Table from '../components/game/Table';

export default function GamePage() {
  const { roomId: inviteCode } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { setRoom, setSeats, updateSeat, setGameState, setAvailableActions, setMySeatIndex, reset } = useGameStore();
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!inviteCode || !user) return;

    const socket = connectSocket();

    socket.on('connect', () => {
      setConnected(true);
      socket.emit(C2S.JOIN_ROOM, { inviteCode });
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('connect_error', (err) => {
      console.error('Socket connect error:', err.message);
      setError('Connection failed: ' + err.message);
    });

    // Full room state on join
    socket.on(S2C.ROOM_STATE, (state: RoomState) => {
      setRoom(state.id, state.inviteCode, state.name);
      setSeats(state.seats);
      setGameState(state.gameState);
      const myIdx = state.seats.findIndex((s) => s?.userId === user.id);
      setMySeatIndex(myIdx >= 0 ? myIdx : null);
    });

    // Player seated
    socket.on(S2C.PLAYER_SEATED, (data: { seatIndex: number; userId: string; username: string; chips: number }) => {
      const seat: PlayerSeat = {
        seatIndex: data.seatIndex,
        userId: data.userId,
        username: data.username,
        chips: data.chips,
        hands: [],
        isReady: false,
        isConnected: true,
        currentBet: 0,
      };
      updateSeat(data.seatIndex, seat);
      if (data.userId === user.id) {
        setMySeatIndex(data.seatIndex);
      }
    });

    // Player unseated
    socket.on(S2C.PLAYER_UNSEATED, (data: { seatIndex: number }) => {
      const currentSeat = useGameStore.getState().seats[data.seatIndex];
      if (currentSeat?.userId === user.id) {
        setMySeatIndex(null);
      }
      updateSeat(data.seatIndex, null);
    });

    // Player ready changed
    socket.on(S2C.PLAYER_READY, (data: { userId: string; isReady: boolean }) => {
      const seats = useGameStore.getState().seats;
      const idx = seats.findIndex((s) => s?.userId === data.userId);
      if (idx >= 0 && seats[idx]) {
        updateSeat(idx, { ...seats[idx]!, isReady: data.isReady });
      }
    });

    // Game events
    socket.on(S2C.BETTING_OPEN, () => {
      setGameState({ id: '', status: 'BETTING', dealerHand: [], currentSeatIndex: -1, currentHandIndex: 0, timeRemaining: 15, roundNumber: 0 });
    });

    socket.on(S2C.CARDS_DEALT, (data: { players: Record<number, { seatIndex: number; hands: any[] }>; dealerHand: any[] }) => {
      const seats = useGameStore.getState().seats;
      for (const [seatIdx, playerData] of Object.entries(data.players)) {
        const i = parseInt(seatIdx);
        if (seats[i]) {
          updateSeat(i, { ...seats[i]!, hands: playerData.hands });
        }
      }
      setGameState((prev) => ({ ...(prev || { id: '', status: 'DEALING', currentSeatIndex: -1, currentHandIndex: 0, timeRemaining: 0, roundNumber: 0 }), status: 'DEALING', dealerHand: data.dealerHand }));
    });

    socket.on(S2C.TURN_START, (data: { seatIndex: number; handIndex: number; actions: AvailableActions; timeRemaining: number }) => {
      setGameState((prev) => ({ ...(prev || { id: '', status: 'PLAYER_TURNS', dealerHand: [], currentSeatIndex: -1, currentHandIndex: 0, timeRemaining: 20, roundNumber: 0 }), status: 'PLAYER_TURNS', currentSeatIndex: data.seatIndex, currentHandIndex: data.handIndex, timeRemaining: data.timeRemaining }));
      const mySeat = useGameStore.getState().mySeatIndex;
      if (data.seatIndex === mySeat) {
        setAvailableActions(data.actions);
      } else {
        setAvailableActions(null);
      }
    });

    socket.on(S2C.DEALER_REVEAL, (data: { card: any; value: any }) => {
      setGameState((prev) => {
        if (!prev) return prev;
        const dealerHand = [...prev.dealerHand];
        if (dealerHand.length > 1) dealerHand[1] = { ...dealerHand[1], faceUp: true };
        return { ...prev, status: 'DEALER_TURN', dealerHand, dealerValue: data.value };
      });
    });

    socket.on(S2C.DEALER_DRAW, (data: { card: any; value: any }) => {
      setGameState((prev) => {
        if (!prev) return prev;
        return { ...prev, dealerHand: [...prev.dealerHand, data.card], dealerValue: data.value };
      });
    });

    socket.on(S2C.ROUND_COMPLETE, (data: Record<number, { chipChange: number; newTotal: number }>) => {
      setGameState(null);
      setAvailableActions(null);
      // Update chips
      for (const [seatIdx, result] of Object.entries(data)) {
        const i = parseInt(seatIdx);
        const seats = useGameStore.getState().seats;
        if (seats[i]) {
          updateSeat(i, { ...seats[i]!, chips: result.newTotal, hands: [], currentBet: 0, isReady: false });
        }
        if (i === useGameStore.getState().mySeatIndex) {
          useAuthStore.getState().updateChips(result.newTotal);
        }
      }
    });

    socket.on(S2C.ERROR, (msg: string) => {
      console.warn('Game error:', msg);
      if (msg === 'Seat taken' || msg === 'Already seated') return;
      setError(msg);
    });

    return () => {
      socket.emit(C2S.LEAVE_ROOM);
      disconnectSocket();
      reset();
    };
  }, [inviteCode, user]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: '#0a0f1c' }}>
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={() => navigate('/lobby')} className="text-amber-400 underline">
          Back to Lobby
        </button>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0f1c' }}>
        <p className="text-gray-400 animate-pulse">Connecting...</p>
      </div>
    );
  }

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at center top, #131c30 0%, #0a0f1c 60%, #05080f 100%)',
      }}
    >
      {/* Fair Play Guaranteed banner */}
      <div
        className="w-full flex items-center justify-center py-1.5 z-30"
        style={{
          background:
            'linear-gradient(180deg, #a32028 0%, #8b1a1f 50%, #5e1014 100%)',
          borderBottom: '1px solid rgba(0,0,0,0.5)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
        }}
      >
        <span
          className="text-[12px] font-extrabold tracking-[0.18em]"
          style={{
            color: '#f5d27a',
            textShadow: '0 1px 2px rgba(0,0,0,0.85)',
          }}
        >
          ★ FAIR PLAY GUARANTEED ★
        </span>
      </div>

      <div className="flex-1 relative">
        <Table />
      </div>
    </div>
  );
}
