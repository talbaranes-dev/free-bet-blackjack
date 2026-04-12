import { create } from 'zustand';
import type { GameState, PlayerSeat, AvailableActions } from '@shared/types';

interface GameStoreState {
  roomId: string | null;
  inviteCode: string | null;
  roomName: string | null;
  seats: (PlayerSeat | null)[];
  gameState: GameState | null;
  availableActions: AvailableActions | null;
  mySeatIndex: number | null;

  setRoom: (roomId: string, inviteCode: string, name: string) => void;
  setSeats: (seats: (PlayerSeat | null)[]) => void;
  updateSeat: (index: number, seat: PlayerSeat | null) => void;
  setGameState: (state: GameState | null) => void;
  setAvailableActions: (actions: AvailableActions | null) => void;
  setMySeatIndex: (index: number | null) => void;
  updatePlayerHand: (seatIndex: number, hands: PlayerSeat['hands']) => void;
  reset: () => void;
}

export const useGameStore = create<GameStoreState>((set) => ({
  roomId: null,
  inviteCode: null,
  roomName: null,
  seats: [null, null, null, null, null],
  gameState: null,
  availableActions: null,
  mySeatIndex: null,

  setRoom: (roomId, inviteCode, name) => set({ roomId, inviteCode, roomName: name }),

  setSeats: (seats) => set({ seats }),

  updateSeat: (index, seat) =>
    set((state) => {
      const seats = [...state.seats];
      seats[index] = seat;
      return { seats };
    }),

  setGameState: (gameState) => set({ gameState }),

  setAvailableActions: (availableActions) => set({ availableActions }),

  setMySeatIndex: (mySeatIndex) => set({ mySeatIndex }),

  updatePlayerHand: (seatIndex, hands) =>
    set((state) => {
      const seats = [...state.seats];
      if (seats[seatIndex]) {
        seats[seatIndex] = { ...seats[seatIndex]!, hands };
      }
      return { seats };
    }),

  reset: () =>
    set({
      roomId: null,
      inviteCode: null,
      roomName: null,
      seats: [null, null, null, null, null],
      gameState: null,
      availableActions: null,
      mySeatIndex: null,
    }),
}));
