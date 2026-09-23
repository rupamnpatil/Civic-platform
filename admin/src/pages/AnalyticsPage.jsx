import React, { useEffect, useState, useMemo } from 'react';
import client from '../api/client';
import {
  CATEGORIES, CATEGORY_EMOJI,
  STATUSES, STATUS_LABELS, STATUS_COLORS, STATUS_BG,
} from '../utils/categories';

export default function AnalyticsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await client.get('/reports');
        setReports(res.data.reports || []);
      } catch (err) { console.log(err.message); }
      finally { setLoading(false); }
    })();
  }, []);

  const analytics = useMemo(() => {
    const byCategory = {};
    const byStatus = {};
    const byDay = {};

    reports.forEach((r) => {
      byCategory[r.category] = (byCategory[r.category] || 0) + 1;
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
      const day = new Date(r.createdAt).toISOString().split('T')[0];
      byDay[day] = (byDay[day] || 0) + 1;
    });

    const resolved = reports.filter((r) => r.status === 'resolved');
    let avgHours = 0;
    if (resolved.length > 0) {
      const totalMs = resolved.reduce((sum, r) => {
        const resolvedAt = r.statusHistory?.find((s) => s.status === 'resolved')?.timestamp;
        if (!resolvedAt) return sum;
        return sum + (new Date(resolvedAt) - new Date(r.createdAt));
      }, 0);
      avgHours = (totalMs / resolved.length / (1000 * 60 * 60)).toFixed(1);
    }

    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      last7.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        count: byDay[key] || 0,
      });
    }

    const totalUpvotes = reports.reduce((s, r) => s + (r.upvotes?.length || 0), 0);
    const resolutionRate = reports.length
      ? ((resolved.length / reports.length) * 100).toFixed(0)
      : 0;

    return { byCategory, byStatus, avgHours, last7, totalUpvotes, resolutionRate };
  }, [reports]);

  if (loading) return <div className="p-6 text-sm text-slate-400">Loading analytics…</div>;

  const maxDay = Math.max(...analytics.last7.map((d) => d.count), 1);
  const maxCat = Math.max(...Object.values(analytics.byCategory), 1);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-[10px] font-extrabold text-teal-600 uppercase tracking-widest mb-1">
          Insights
        </p>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Analytics
        </h1>
        <p className="text-sm text-slate-500 mt-1 mb-8">
          Overview of municipal performance and reporting trends.
        </p>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          <KPI label="Total Reports" value={reports.length} accent="slate" />
          <KPI label="Resolution Rate" value={`${analytics.resolutionRate}%`} accent="teal" />
          <KPI label="Avg Resolution" value={`${analytics.avgHours}h`} accent="violet" />
          <KPI label="Total Upvotes" value={analytics.totalUpvotes} accent="amber" />
        </div>

        <div className="grid grid-cols-2 gap-5">
          {/* Category */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-5">
              Reports by Category
            </h2>
            {Object.keys(analytics.byCategory).length === 0 ? (
              <p className="text-xs text-slate-400">No data yet.</p>
            ) : (
              CATEGORIES.map((c) => {
                const count = analytics.byCategory[c.id] || 0;
                if (count === 0) return null;
                const pct = (count / maxCat) * 100;
                return (
                  <div key={c.id} className="mb-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                        {c.emoji} {c.label}
                      </span>
                      <span className="font-extrabold text-slate-900">{count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-900 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-5">
              Reports by Status
            </h2>
            {Object.keys(analytics.byStatus).length === 0 ? (
              <p className="text-xs text-slate-400">No data yet.</p>
            ) : (
              STATUSES.map((s) => {
                const count = analytics.byStatus[s] || 0;
                if (count === 0) return null;
                return (
                  <div key={s} className="mb-3 flex items-center gap-3">
                    <div
                      className="w-1 h-10 rounded"
                      style={{ backgroundColor: STATUS_COLORS[s] }}
                    />
                    <div className="flex-1">
                      <p className="font-bold text-slate-700 text-xs uppercase tracking-wider text-[10px]">
                        {STATUS_LABELS[s]}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        {((count / reports.length) * 100).toFixed(0)}% of total
                      </p>
                    </div>
                    <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                      {count}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Weekly */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 col-span-2">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-5">
              Reports — Last 7 Days
            </h2>
            <div className="flex items-end justify-between gap-3 h-44">
              {analytics.last7.map((d, i) => {
                const h = (d.count / maxDay) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2">
                    <span className="text-[10px] font-extrabold text-slate-700">
                      {d.count}
                    </span>
                    <div
                      className="w-full bg-slate-900 rounded-t-md transition-all"
                      style={{ height: `${Math.max(h, 4)}%` }}
                    />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="h-10" />
      </div>
    </div>
  );
}

function KPI({ label, value, accent }) {
  const accentClass = {
    slate: 'text-slate-900',
    teal: 'text-teal-600',
    violet: 'text-violet-600',
    amber: 'text-amber-600',
  }[accent];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className={`text-3xl font-extrabold tracking-tight ${accentClass}`}>
        {value}
      </p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
        {label}
      </p>
    </div>
  );
}