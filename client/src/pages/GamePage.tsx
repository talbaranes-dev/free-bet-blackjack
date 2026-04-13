import { useEffect, useState, useRef } from 'react';
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
  const socketRef = useRef<any>(null);
  const setupDone = useRef(false);

  // Only run once when inviteCode changes
  useEffect(() => {
    if (!inviteCode) return;
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;
    if (setupDone.current) return; // Prevent double setup
    setupDone.current = true;

    let cancelled = false;

    (async () => {
      const socket = await connectSocket();
      if (cancelled) return;
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('[SOCKET] Connected');
        setConnected(true);
        socket.emit(C2S.JOIN_ROOM, { inviteCode });
      });

      socket.on('disconnect', (reason: string) => {
        console.log('[SOCKET] Disconnected:', reason);
      });

      socket.on('connect_error', (err: Error) => {
        console.error('[SOCKET] Connect error:', err.message);
      });

      socket.onAny((event: string, ...args: any[]) => {
        console.log('[SOCKET EVENT]', event);
      });

      // Room state
      socket.on(S2C.ROOM_STATE, (state: RoomState) => {
        setRoom(state.id, state.inviteCode, state.name);
        setSeats(state.seats);
        setGameState(state.gameState);
        const u = useAuthStore.getState().user;
        const myIdx = state.seats.findIndex((s) => s?.userId === u?.id);
        setMySeatIndex(myIdx >= 0 ? myIdx : null);
      });

      socket.on(S2C.PLAYER_SEATED, (data: { seatIndex: number; userId: string; username: string; chips: number }) => {
        const seat: PlayerSeat = {
          seatIndex: data.seatIndex, userId: data.userId, username: data.username,
          chips: data.chips, hands: [], isReady: false, isConnected: true, currentBet: 0,
        };
        updateSeat(data.seatIndex, seat);
        const u = useAuthStore.getState().user;
        if (data.userId === u?.id) setMySeatIndex(data.seatIndex);
      });

      socket.on(S2C.PLAYER_UNSEATED, (data: { seatIndex: number }) => {
        const u = useAuthStore.getState().user;
        const currentSeat = useGameStore.getState().seats[data.seatIndex];
        if (currentSeat?.userId === u?.id) setMySeatIndex(null);
        updateSeat(data.seatIndex, null);
      });

      socket.on(S2C.PLAYER_READY, (data: { userId: string; isReady: boolean }) => {
        const seats = useGameStore.getState().seats;
        const idx = seats.findIndex((s) => s?.userId === data.userId);
        if (idx >= 0 && seats[idx]) {
          updateSeat(idx, { ...seats[idx]!, isReady: data.isReady });
        }
      });

      // Game flow
      socket.on(S2C.BETTING_OPEN, () => {
        setGameState({ id: '', status: 'BETTING', dealerHand: [], currentSeatIndex: -1, currentHandIndex: 0, timeRemaining: 15, roundNumber: 0 });
        setAvailableActions(null);
      });

      socket.on(S2C.BET_PLACED, (data: { seatIndex: number; amount: number }) => {
        const seats = useGameStore.getState().seats;
        const seat = seats[data.seatIndex];
        if (seat) updateSeat(data.seatIndex, { ...seat, currentBet: data.amount });
      });

      socket.on(S2C.CARDS_DEALT, (data: { players: Record<number, { seatIndex: number; hands: any[] }>; dealerHand: any[] }) => {
        const seats = useGameStore.getState().seats;
        for (const [seatIdx, playerData] of Object.entries(data.players)) {
          const i = parseInt(seatIdx);
          if (seats[i]) updateSeat(i, { ...seats[i]!, hands: playerData.hands });
        }
        setGameState((prev: any) => ({ ...(prev || { id: '', status: 'DEALING', currentSeatIndex: -1, currentHandIndex: 0, timeRemaining: 0, roundNumber: 0 }), status: 'DEALING', dealerHand: data.dealerHand }));
      });

      socket.on(S2C.TURN_START, (data: { seatIndex: number; handIndex: number; actions: AvailableActions; timeRemaining: number }) => {
        setGameState((prev: any) => ({ ...(prev || { id: '', status: 'PLAYER_TURNS', dealerHand: [], currentSeatIndex: -1, currentHandIndex: 0, timeRemaining: 20, roundNumber: 0 }), status: 'PLAYER_TURNS', currentSeatIndex: data.seatIndex, currentHandIndex: data.handIndex, timeRemaining: data.timeRemaining }));
        const mySeat = useGameStore.getState().mySeatIndex;
        if (data.seatIndex === mySeat) {
          setAvailableActions(data.actions);
        } else {
          setAvailableActions(null);
        }
      });

      socket.on(S2C.CARD_DRAWN, (data: { seatIndex: number; handIndex: number; card: any }) => {
        const seats = useGameStore.getState().seats;
        const seat = seats[data.seatIndex];
        if (seat && seat.hands[data.handIndex]) {
          const hands = [...seat.hands];
          hands[data.handIndex] = { ...hands[data.handIndex], cards: [...hands[data.handIndex].cards, data.card] };
          updateSeat(data.seatIndex, { ...seat, hands });
        }
      });

      socket.on(S2C.HAND_DOUBLED, (data: { seatIndex: number; handIndex: number; card: any; freeBet: boolean }) => {
        const seats = useGameStore.getState().seats;
        const seat = seats[data.seatIndex];
        if (seat && seat.hands[data.handIndex]) {
          const hands = [...seat.hands];
          hands[data.handIndex] = { ...hands[data.handIndex], cards: [...hands[data.handIndex].cards, data.card], freeBet: data.freeBet };
          updateSeat(data.seatIndex, { ...seat, hands });
        }
      });

      socket.on(S2C.HAND_BUSTED, (data: { seatIndex: number; handIndex: number }) => {
        const seats = useGameStore.getState().seats;
        const seat = seats[data.seatIndex];
        if (seat && seat.hands[data.handIndex]) {
          const hands = [...seat.hands];
          hands[data.handIndex] = { ...hands[data.handIndex], status: 'BUSTED' as const };
          updateSeat(data.seatIndex, { ...seat, hands });
        }
      });

      socket.on(S2C.HAND_STOOD, (data: { seatIndex: number; handIndex: number }) => {
        const seats = useGameStore.getState().seats;
        const seat = seats[data.seatIndex];
        if (seat && seat.hands[data.handIndex]) {
          const hands = [...seat.hands];
          hands[data.handIndex] = { ...hands[data.handIndex], status: 'STOOD' as const };
          updateSeat(data.seatIndex, { ...seat, hands });
        }
      });

      socket.on(S2C.HAND_SURRENDERED, (data: { seatIndex: number; handIndex: number }) => {
        const seats = useGameStore.getState().seats;
        const seat = seats[data.seatIndex];
        if (seat && seat.hands[data.handIndex]) {
          const hands = [...seat.hands];
          hands[data.handIndex] = { ...hands[data.handIndex], status: 'SURRENDERED' as const };
          updateSeat(data.seatIndex, { ...seat, hands });
        }
      });

      socket.on(S2C.HAND_SPLIT, (data: { seatIndex: number; hands: any[] }) => {
        const seats = useGameStore.getState().seats;
        const seat = seats[data.seatIndex];
        if (seat) updateSeat(data.seatIndex, { ...seat, hands: data.hands });
      });

      socket.on(S2C.HAND_RESULT, (data: { seatIndex: number; handIndex: number; result: any; payout: number }) => {
        const seats = useGameStore.getState().seats;
        const seat = seats[data.seatIndex];
        if (seat && seat.hands[data.handIndex]) {
          const hands = [...seat.hands];
          hands[data.handIndex] = { ...hands[data.handIndex], result: data.result, payout: data.payout };
          updateSeat(data.seatIndex, { ...seat, hands });
        }
      });

      socket.on(S2C.DEALER_REVEAL, (data: { card: any; value: any }) => {
        setGameState((prev: any) => {
          if (!prev) return prev;
          const dealerHand = [...prev.dealerHand];
          if (dealerHand.length > 1) dealerHand[1] = { ...dealerHand[1], faceUp: true };
          return { ...prev, status: 'DEALER_TURN', dealerHand, dealerValue: data.value };
        });
      });

      socket.on(S2C.DEALER_DRAW, (data: { card: any; value: any }) => {
        setGameState((prev: any) => {
          if (!prev) return prev;
          return { ...prev, dealerHand: [...prev.dealerHand, data.card], dealerValue: data.value };
        });
      });

      socket.on(S2C.ROUND_COMPLETE, (data: Record<number, { chipChange: number; newTotal: number }>) => {
        // Don't clear game state immediately - let players see results
        // The next BETTING_OPEN will reset it
        setAvailableActions(null);
        for (const [seatIdx, result] of Object.entries(data)) {
          const i = parseInt(seatIdx);
          const seats = useGameStore.getState().seats;
          if (seats[i]) {
            updateSeat(i, { ...seats[i]!, chips: result.newTotal });
          }
        }
        // Update local user chips without triggering re-render of this component
        const mySeatIdx = useGameStore.getState().mySeatIndex;
        if (mySeatIdx !== null && data[mySeatIdx]) {
          useAuthStore.setState((state) => ({
            user: state.user ? { ...state.user, chips: data[mySeatIdx].newTotal } : null,
          }));
          localStorage.setItem('user', JSON.stringify({ ...useAuthStore.getState().user }));
        }
      });

      socket.on(S2C.ERROR, (msg: string) => {
        console.warn('Game error:', msg);
        if (msg === 'Room not found' || msg === 'Failed to join room') {
          setError(msg);
        }
      });
    })();

    return () => {
      cancelled = true;
      setupDone.current = false;
      if (socketRef.current) {
        socketRef.current.emit(C2S.LEAVE_ROOM);
      }
      disconnectSocket();
      reset();
    };
  }, [inviteCode]);

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
      <div
        className="w-full flex items-center justify-center py-1.5 z-30"
        style={{
          background: 'linear-gradient(180deg, #a32028 0%, #8b1a1f 50%, #5e1014 100%)',
          borderBottom: '1px solid rgba(0,0,0,0.5)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
        }}
      >
        <span className="text-[12px] font-extrabold tracking-[0.18em]"
          style={{ color: '#f5d27a', textShadow: '0 1px 2px rgba(0,0,0,0.85)' }}>
          ★ FAIR PLAY GUARANTEED ★
        </span>
      </div>
      <div className="flex-1 relative">
        <Table />
      </div>
    </div>
  );
}
