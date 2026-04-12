import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { LeaderboardEntry } from '@shared/types';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/leaderboard')
      .then(({ data }) => setEntries(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0f0f23' }}>
      <div className="max-w-sm mx-auto">
        <Link to="/" className="text-gray-400 text-sm mb-6 block">&larr; Back</Link>

        <h1 className="text-2xl font-bold mb-6" style={{ color: '#ffd700' }}>Leaderboard</h1>

        {loading ? (
          <p className="text-gray-400 animate-pulse">Loading...</p>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.userId}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
              >
                <span
                  className="w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm"
                  style={{
                    backgroundColor: entry.rank <= 3 ? '#ffd700' : 'rgba(255,255,255,0.1)',
                    color: entry.rank <= 3 ? '#000' : '#fff',
                  }}
                >
                  {entry.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{entry.username}</p>
                  <p className="text-xs text-gray-400">
                    {entry.gamesWon}W / {entry.gamesPlayed}G
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold" style={{ color: '#ffd700' }}>
                    {entry.chips.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">chips</p>
                </div>
              </div>
            ))}
            {entries.length === 0 && (
              <p className="text-gray-500 text-center py-8">No players yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
