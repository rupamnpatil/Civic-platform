import React, { useEffect, useState } from 'react';
import client from '../api/client';

const BADGE_LABELS = {
  first_reporter: 'First Reporter',
  reporter: 'Reporter',
  civic_hero: 'Civic Hero',
  community_voice: 'Community Voice',
  trending: 'Trending',
  verified: 'Verified',
};

// Ranks are 0-based: 0 = 1st place, 1 = 2nd, 2 = 3rd
const PODIUM_ORDER = [1, 0, 2]; // render order: 2nd place on left, 1st in middle, 3rd on right
const RANK_HEIGHTS = ['h-40', 'h-32', 'h-24'];
const RANK_MEDALS = ['🥇', '🥈', '🥉'];
const RANK_COLORS = [
  'from-amber-400 to-yellow-500',
  'from-slate-300 to-slate-400',
  'from-orange-400 to-orange-500',
];

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await client.get('/users/leaderboard');
        setLeaders(res.data.leaderboard || []);
      } catch (err) {
        console.log(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-[10px] font-extrabold text-teal-600 uppercase tracking-widest mb-1">
          Community
        </p>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Top Citizens
        </h1>
        <p className="text-sm text-slate-500 mt-1 mb-8">
          Ranked by civic points earned from reports, upvotes, and resolutions.
        </p>

        {loading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : leaders.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
            <p className="text-sm text-slate-400">No citizens yet.</p>
          </div>
        ) : (
          <>
            {/* Podium */}
            {leaders.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-8 items-end">
                {PODIUM_ORDER.map((rank) => {
                  const u = leaders[rank];
                  if (!u) return <div key={rank} />;
                  return (
                    <div key={u._id} className="text-center">
                      <div className="mb-3">
                        <div className="w-14 h-14 rounded-full bg-white border-2 border-slate-200 mx-auto flex items-center justify-center text-lg font-extrabold text-slate-900 shadow-sm">
                          {(u.name?.[0] || 'U').toUpperCase()}
                        </div>
                        <p className="font-bold text-slate-900 mt-2 text-sm truncate px-2">
                          {u.name}
                        </p>
                        <p className="text-[10px] text-teal-600 font-extrabold uppercase tracking-widest mt-0.5">
                          {u.points} pts
                        </p>
                      </div>
                      <div
                        className={`bg-gradient-to-br ${RANK_COLORS[rank]} ${RANK_HEIGHTS[rank]} rounded-t-xl flex items-start justify-center pt-2 shadow-md`}
                      >
                        <span className="text-2xl">{RANK_MEDALS[rank]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Full list */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {leaders.map((u, idx) => (
                <div
                  key={u._id}
                  className={`flex items-center gap-4 px-5 py-4 ${
                    idx !== leaders.length - 1 ? 'border-b border-slate-100' : ''
                  }`}
                >
                  <span className="w-8 text-center text-sm font-extrabold text-slate-400 tracking-wider">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-extrabold text-slate-900 text-sm">
                    {(u.name?.[0] || 'U').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">{u.name}</p>
                    {u.badges?.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {u.badges.slice(0, 3).map((b) => (
                          <span
                            key={b}
                            className="text-[9px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-extrabold uppercase tracking-wider"
                          >
                            {BADGE_LABELS[b] || b}
                          </span>
                        ))}
                        {u.badges.length > 3 && (
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                            +{u.badges.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-extrabold text-slate-900 tracking-tight">
                      {u.points}
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                      points
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        <div className="h-10" />
      </div>
    </div>
  );
}
