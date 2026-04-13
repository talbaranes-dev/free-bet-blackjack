import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '../stores/gameStore';
import { useAuthStore } from '../stores/authStore';
import { S2C, C2S } from '@shared/events';
import type { RoomState, AvailableActions, PlayerSeat } from '@shared/types';

// Module-level socket - survives re-renders
let gameSocket: Socket | null = null;
let currentRoom: string | null = null;

export function useGameSocket(inviteCode: string | undefined) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!inviteCode) return;
    const user = useAuthStore.getState().user;
    const token = useAuthStore.getState().accessToken;
    if (!user || !token) return;

    // If already connected to this room, skip
    if (gameSocket?.connected && currentRoom === inviteCode) {
      return;
    }

    // If connected to different room, leave it
    if (gameSocket) {
      if (currentRoom) gameSocket.emit(C2S.LEAVE_ROOM);
      gameSocket.removeAllListeners();
      gameSocket.disconnect();
      gameSocket = null;
      currentRoom = null;
    }

    const { setRoom, setSeats, updateSeat, setGameState, setAvailableActions, setMySeatIndex } = useGameStore.getState();

    const serverUrl = import.meta.env.VITE_SERVER_URL || '';
    gameSocket = io(serverUrl, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      transports: ['polling', 'websocket'],
    });

    const s = gameSocket;

    s.on('connect', () => {
      console.log('[GS] Connected');
      useGameStore.setState({ connected: true });
      s.emit(C2S.JOIN_ROOM, { inviteCode });
      currentRoom = inviteCode;
    });

    s.on('disconnect', (reason: string) => {
      console.log('[GS] Disconnected:', reason);
      // Only mark disconnected if server kicked us
      if (reason === 'io server disconnect') {
        useGameStore.setState({ connected: false });
      }
    });

    s.on('connect_error', (err: Error) => {
      console.error('[GS] Connect error:', err.message);
    });

    // === ROOM EVENTS ===
    s.on(S2C.ROOM_STATE, (state: RoomState) => {
      setRoom(state.id, state.inviteCode, state.name);
      setSeats(state.seats);
      setGameState(state.gameState);
      const u = useAuthStore.getState().user;
      const myIdx = state.seats.findIndex((seat) => seat?.userId === u?.id);
      setMySeatIndex(myIdx >= 0 ? myIdx : null);
      useGameStore.setState({ connected: true });
    });

    s.on(S2C.PLAYER_SEATED, (data: { seatIndex: number; userId: string; username: string; chips: number }) => {
      const seat: PlayerSeat = {
        seatIndex: data.seatIndex, userId: data.userId, username: data.username,
        chips: data.chips, hands: [], isReady: false, isConnected: true, currentBet: 0,
      };
      updateSeat(data.seatIndex, seat);
      if (data.userId === useAuthStore.getState().user?.id) setMySeatIndex(data.seatIndex);
    });

    s.on(S2C.PLAYER_UNSEATED, (data: { seatIndex: number }) => {
      const currentSeat = useGameStore.getState().seats[data.seatIndex];
      if (currentSeat?.userId === useAuthStore.getState().user?.id) setMySeatIndex(null);
      updateSeat(data.seatIndex, null);
    });

    s.on(S2C.PLAYER_READY, (data: { userId: string; isReady: boolean }) => {
      const seats = useGameStore.getState().seats;
      const idx = seats.findIndex((seat) => seat?.userId === data.userId);
      if (idx >= 0 && seats[idx]) updateSeat(idx, { ...seats[idx]!, isReady: data.isReady });
    });

    // === GAME EVENTS ===
    s.on(S2C.BETTING_OPEN, () => {
      // Reset hands and bets for new round
      const seats = useGameStore.getState().seats;
      seats.forEach((seat, i) => {
        if (seat) updateSeat(i, { ...seat, hands: [], currentBet: 0 });
      });
      setGameState({ id: '', status: 'BETTING', dealerHand: [], currentSeatIndex: -1, currentHandIndex: 0, timeRemaining: 15, roundNumber: 0 });
      setAvailableActions(null);
    });

    s.on(S2C.BET_PLACED, (data: { seatIndex: number; amount: number }) => {
      const seat = useGameStore.getState().seats[data.seatIndex];
      if (seat) updateSeat(data.seatIndex, { ...seat, currentBet: data.amount });
    });

    s.on(S2C.CARDS_DEALT, (data: { players: Record<string, { seatIndex: number; hands: any[] }>; dealerHand: any[] }) => {
      const seats = useGameStore.getState().seats;
      for (const [seatIdx, playerData] of Object.entries(data.players)) {
        const i = parseInt(seatIdx);
        if (seats[i]) updateSeat(i, { ...seats[i]!, hands: playerData.hands });
      }
      const prev = useGameStore.getState().gameState;
      setGameState({ ...(prev || { id: '', currentSeatIndex: -1, currentHandIndex: 0, timeRemaining: 0, roundNumber: 0 }), status: 'DEALING', dealerHand: data.dealerHand });
    });

    s.on(S2C.TURN_START, (data: { seatIndex: number; handIndex: number; actions: AvailableActions; timeRemaining: number }) => {
      const prev = useGameStore.getState().gameState;
      setGameState({ ...(prev || { id: '', dealerHand: [], currentSeatIndex: -1, currentHandIndex: 0, timeRemaining: 20, roundNumber: 0 }), status: 'PLAYER_TURNS', currentSeatIndex: data.seatIndex, currentHandIndex: data.handIndex, timeRemaining: data.timeRemaining });
      const mySeat = useGameStore.getState().mySeatIndex;
      setAvailableActions(data.seatIndex === mySeat ? data.actions : null);
    });

    s.on(S2C.CARD_DRAWN, (data: { seatIndex: number; handIndex: number; card: any }) => {
      const seat = useGameStore.getState().seats[data.seatIndex];
      if (seat?.hands[data.handIndex]) {
        const hands = seat.hands.map((h, i) => i === data.handIndex ? { ...h, cards: [...h.cards, data.card] } : h);
        updateSeat(data.seatIndex, { ...seat, hands });
      }
    });

    s.on(S2C.HAND_DOUBLED, (data: { seatIndex: number; handIndex: number; card: any; freeBet: boolean }) => {
      const seat = useGameStore.getState().seats[data.seatIndex];
      if (seat?.hands[data.handIndex]) {
        const hands = seat.hands.map((h, i) => i === data.handIndex ? { ...h, cards: [...h.cards, data.card], freeBet: data.freeBet } : h);
        updateSeat(data.seatIndex, { ...seat, hands });
      }
    });

    s.on(S2C.HAND_BUSTED, (data: { seatIndex: number; handIndex: number }) => {
      const seat = useGameStore.getState().seats[data.seatIndex];
      if (seat?.hands[data.handIndex]) {
        const hands = seat.hands.map((h, i) => i === data.handIndex ? { ...h, status: 'BUSTED' as const } : h);
        updateSeat(data.seatIndex, { ...seat, hands });
      }
    });

    s.on(S2C.HAND_STOOD, (data: { seatIndex: number; handIndex: number }) => {
      const seat = useGameStore.getState().seats[data.seatIndex];
      if (seat?.hands[data.handIndex]) {
        const hands = seat.hands.map((h, i) => i === data.handIndex ? { ...h, status: 'STOOD' as const } : h);
        updateSeat(data.seatIndex, { ...seat, hands });
      }
    });

    s.on(S2C.HAND_SURRENDERED, (data: { seatIndex: number; handIndex: number }) => {
      const seat = useGameStore.getState().seats[data.seatIndex];
      if (seat?.hands[data.handIndex]) {
        const hands = seat.hands.map((h, i) => i === data.handIndex ? { ...h, status: 'SURRENDERED' as const } : h);
        updateSeat(data.seatIndex, { ...seat, hands });
      }
    });

    s.on(S2C.HAND_SPLIT, (data: { seatIndex: number; hands: any[] }) => {
      const seat = useGameStore.getState().seats[data.seatIndex];
      if (seat) updateSeat(data.seatIndex, { ...seat, hands: data.hands });
    });

    s.on(S2C.HAND_RESULT, (data: { seatIndex: number; handIndex: number; result: any; payout: number }) => {
      const seat = useGameStore.getState().seats[data.seatIndex];
      if (seat?.hands[data.handIndex]) {
        const hands = seat.hands.map((h, i) => i === data.handIndex ? { ...h, result: data.result, payout: data.payout } : h);
        updateSeat(data.seatIndex, { ...seat, hands });
      }
    });

    s.on(S2C.DEALER_REVEAL, (data: { card: any; value: any }) => {
      const prev = useGameStore.getState().gameState;
      if (!prev) return;
      const dealerHand = [...prev.dealerHand];
      if (dealerHand.length > 1) dealerHand[1] = { ...dealerHand[1], faceUp: true };
      setGameState({ ...prev, status: 'DEALER_TURN', dealerHand, dealerValue: data.value });
    });

    s.on(S2C.DEALER_DRAW, (data: { card: any; value: any }) => {
      const prev = useGameStore.getState().gameState;
      if (!prev) return;
      setGameState({ ...prev, dealerHand: [...prev.dealerHand, data.card], dealerValue: data.value });
    });

    s.on(S2C.ROUND_COMPLETE, (data: Record<string, { chipChange: number; newTotal: number }>) => {
      setAvailableActions(null);
      const prev = useGameStore.getState().gameState;
      if (prev) setGameState({ ...prev, status: 'COMPLETE' });

      for (const [seatIdx, result] of Object.entries(data)) {
        const i = parseInt(seatIdx);
        const seat = useGameStore.getState().seats[i];
        if (seat) updateSeat(i, { ...seat, chips: result.newTotal });
      }
      // Update local user chips
      const mySeatIdx = useGameStore.getState().mySeatIndex;
      if (mySeatIdx !== null && data[mySeatIdx]) {
        const u = useAuthStore.getState().user;
        if (u) {
          const updated = { ...u, chips: data[mySeatIdx].newTotal };
          localStorage.setItem('user', JSON.stringify(updated));
          useAuthStore.setState({ user: updated });
        }
      }
    });

    s.on(S2C.ERROR, (msg: string) => {
      console.warn('[GS] Error:', msg);
      if (msg === 'Room not found' || msg === 'Failed to join room') {
        useGameStore.setState({ error: msg });
      }
    });

    // No cleanup that disconnects! Socket stays alive across re-renders.
    // Only disconnect when leaving the page (handled by leaveGame).
  }, [inviteCode]);
}

export function leaveGame() {
  if (gameSocket) {
    if (currentRoom) gameSocket.emit(C2S.LEAVE_ROOM);
    gameSocket.removeAllListeners();
    gameSocket.disconnect();
    gameSocket = null;
    currentRoom = null;
  }
  useGameStore.getState().reset();
}

export function getGameSocket(): Socket | null {
  return gameSocket;
}
