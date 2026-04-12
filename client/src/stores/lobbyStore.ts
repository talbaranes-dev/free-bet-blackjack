import { create } from 'zustand';

interface RoomInfo {
  id: string;
  inviteCode: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
}

interface LobbyState {
  rooms: RoomInfo[];
  setRooms: (rooms: RoomInfo[]) => void;
}

export const useLobbyStore = create<LobbyState>((set) => ({
  rooms: [],
  setRooms: (rooms) => set({ rooms }),
}));
