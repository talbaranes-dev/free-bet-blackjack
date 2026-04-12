import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function LobbyPage() {
  const [joinCode, setJoinCode] = useState('');
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const createRoom = async () => {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/rooms', { name: roomName || 'My Table' });
      navigate(`/game/${data.inviteCode}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!joinCode.trim()) return;
    navigate(`/game/${joinCode.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0f0f23' }}>
      <div className="max-w-sm mx-auto">
        <Link to="/" className="text-gray-400 text-sm mb-6 block">&larr; Back</Link>

        <h1 className="text-2xl font-bold mb-8" style={{ color: '#ffd700' }}>Lobby</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 rounded text-sm mb-4">
            {error}
          </div>
        )}

        {/* Create Room */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-white">Create a Table</h2>
          <input
            type="text"
            placeholder="Table name (optional)"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            maxLength={30}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 mb-3"
          />
          <button
            onClick={createRoom}
            disabled={loading}
            className="w-full py-3 rounded-lg font-bold text-black transition-transform active:scale-95"
            style={{ backgroundColor: '#ffd700' }}
          >
            {loading ? 'Creating...' : 'Create Table'}
          </button>
        </div>

        {/* Join Room */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-white">Join a Table</h2>
          <input
            type="text"
            placeholder="Enter invite code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 mb-3 uppercase tracking-widest text-center text-xl"
          />
          <button
            onClick={joinRoom}
            disabled={!joinCode.trim()}
            className="w-full py-3 rounded-lg font-bold text-white border border-white/30 transition-transform active:scale-95 disabled:opacity-40"
          >
            Join Table
          </button>
        </div>
      </div>
    </div>
  );
}
