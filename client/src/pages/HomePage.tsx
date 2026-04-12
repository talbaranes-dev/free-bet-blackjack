import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: '#0f0f23' }}>
      <h1 className="text-4xl font-bold mb-2" style={{ color: '#ffd700' }}>
        Free Bet
      </h1>
      <h2 className="text-xl text-gray-300 mb-1">Blackjack</h2>

      <div className="flex items-center gap-2 mt-4 mb-10 px-4 py-2 rounded-full bg-white/10">
        <span className="text-gray-400">Chips:</span>
        <span className="font-bold text-lg" style={{ color: '#ffd700' }}>
          {user?.chips?.toLocaleString() || 0}
        </span>
      </div>

      <div className="w-full max-w-xs space-y-3">
        <Link
          to="/lobby"
          className="block w-full py-4 rounded-xl font-bold text-center text-black text-lg transition-transform active:scale-95"
          style={{ backgroundColor: '#ffd700' }}
        >
          Play Now
        </Link>

        <Link
          to="/leaderboard"
          className="block w-full py-4 rounded-xl font-bold text-center text-white text-lg bg-white/10 border border-white/20 transition-transform active:scale-95"
        >
          Leaderboard
        </Link>

        <button
          onClick={logout}
          className="w-full py-3 rounded-xl text-gray-400 text-sm transition-colors hover:text-white"
        >
          Logout ({user?.username})
        </button>
      </div>
    </div>
  );
}
