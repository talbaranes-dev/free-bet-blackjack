import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { useGameSocket, leaveGame } from '../hooks/useGameSocket';
import Table from '../components/game/Table';

export default function GamePage() {
  const { roomId: inviteCode } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const connected = useGameStore((s) => s.connected);
  const error = useGameStore((s) => s.error);

  // Connect socket - this hook does NOT disconnect on re-render
  useGameSocket(inviteCode);

  // Cleanup only when leaving the page
  useEffect(() => {
    return () => {
      leaveGame();
    };
  }, []);

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
        background: 'radial-gradient(ellipse at center top, #131c30 0%, #0a0f1c 60%, #05080f 100%)',
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
