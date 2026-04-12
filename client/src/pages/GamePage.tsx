import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { useAuthStore } from '../stores/authStore';
import { connectSocket, disconnectSocket } from '../services/socket';
import { S2C, C2S } from '@shared/events';
import type { RoomState, AvailableActions } from '@shared/types';
import Table from '../components/game/Table';

export default function GamePage() {
  const { roomId: inviteCode } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { setRoom, setSeats, setGameState, setAvailableActions, setMySeatIndex, reset } = useGameStore();
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

    socket.on(S2C.ROOM_STATE, (state: RoomState) => {
      setRoom(state.id, state.inviteCode, state.name);
      setSeats(state.seats);
      setGameState(state.gameState);
      // Find my seat
      const myIdx = state.seats.findIndex((s) => s?.userId === user.id);
      setMySeatIndex(myIdx >= 0 ? myIdx : null);
    });

    socket.on(S2C.TURN_START, (data: { seatIndex: number; handIndex: number; actions: AvailableActions; timeRemaining: number }) => {
      const currentState = useGameStore.getState().gameState;
      if (currentState) {
        setGameState({ ...currentState, currentSeatIndex: data.seatIndex, currentHandIndex: data.handIndex, timeRemaining: data.timeRemaining });
      }
      const mySeat = useGameStore.getState().mySeatIndex;
      if (data.seatIndex === mySeat) {
        setAvailableActions(data.actions);
      } else {
        setAvailableActions(null);
      }
    });

    socket.on(S2C.ERROR, (msg: string) => setError(msg));

    return () => {
      socket.emit(C2S.LEAVE_ROOM);
      disconnectSocket();
      reset();
    };
  }, [inviteCode, user]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: '#0f0f23' }}>
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={() => navigate('/lobby')} className="text-amber-400 underline">
          Back to Lobby
        </button>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0f0f23' }}>
        <p className="text-gray-400 animate-pulse">Connecting...</p>
      </div>
    );
  }

  return <Table />;
}
