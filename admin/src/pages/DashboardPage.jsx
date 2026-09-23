import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import useSocket from '../hooks/useSocket';
import ReportMap from '../components/ReportMap';
import ReportCard from '../components/ReportCard';
import StatusBadge from '../components/StatusBadge';
import {
  CATEGORIES, CATEGORY_EMOJI, CATEGORY_LABEL,
  STATUSES, STATUS_LABELS, STATUS_COLORS,
} from '../utils/categories';

export default function DashboardPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchReports = async () => {
    try {
      const res = await client.get('/reports');
      setReports(res.data.reports || []);
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  useSocket(
    (r) => setReports((prev) => (prev.some((x) => x._id === r._id) ? prev : [r, ...prev])),
    (u) => setReports((prev) => prev.map((r) => (r._id === u._id ? u : r))),
    ({ id }) => setReports((prev) => prev.filter((r) => r._id !== id))
  );

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (filterStatus && r.status !== filterStatus) return false;
      if (filterCategory && r.category !== filterCategory) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !r.description?.toLowerCase().includes(q) &&
          !r.address?.toLowerCase().includes(q) &&
          !r.category?.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [reports, filterStatus, filterCategory, search]);

  const stats = useMemo(() => ({
    total: reports.length,
    pending: reports.filter((r) => r.status === 'submitted').length,
    progress: reports.filter((r) => r.status === 'in_progress').length,
    resolved: reports.filter((r) => r.status === 'resolved').length,
  }), [reports]);

  const updateStatus = async (newStatus) => {
    if (!selected) return;
    setUpdating(true);
    try {
      const res = await client.patch(`/reports/${selected._id}/status`, {
        status: newStatus,
        note: `Updated by ${user.name}`,
      });
      setReports((prev) =>
        prev.map((r) => (r._id === res.data.report._id ? res.data.report : r))
      );
      setSelected(res.data.report);
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (!window.confirm('Permanently delete this report?')) return;
    try {
      await client.delete(`/reports/${selected._id}`);
      setReports((prev) => prev.filter((r) => r._id !== selected._id));
      setSelected(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 px-6 py-5 bg-slate-50">
        <Stat label="Total Reports" value={stats.total} accent="slate" />
        <Stat label="Pending" value={stats.pending} accent="amber" />
        <Stat label="In Progress" value={stats.progress} accent="violet" />
        <Stat label="Resolved" value={stats.resolved} accent="teal" />
      </div>

      {/* Filters */}
      <div className="px-6 pb-4 bg-slate-50 flex gap-3 items-center flex-wrap">
        <input
          type="text"
          placeholder="Search description or address…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 w-64"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
          ))}
        </select>
        {(filterStatus || filterCategory || search) && (
          <button
            onClick={() => { setFilterStatus(''); setFilterCategory(''); setSearch(''); }}
            className="text-[10px] font-bold text-teal-600 uppercase tracking-widest hover:text-teal-700"
          >
            Clear
          </button>
        )}
        <span className="ml-auto text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          {filtered.length} / {reports.length}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex">
        <aside className="w-96 bg-white border-r border-slate-200 overflow-y-auto p-4">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">
            Queue
          </p>
          {loading ? (
            <p className="text-xs text-slate-400">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-slate-400">No reports match filters.</p>
          ) : (
            filtered.map((r) => (
              <ReportCard
                key={r._id}
                report={r}
                active={selected?._id === r._id}
                onClick={() => setSelected(r)}
              />
            ))
          )}
        </aside>

        <main className="flex-1 relative">
          <ReportMap reports={filtered} onSelect={setSelected} />

          {selected && (
            <div className="absolute top-4 right-4 bg-white rounded-xl w-96 max-h-[calc(100%-2rem)] overflow-y-auto shadow-2xl border border-slate-200 z-[1000]">
              <div className="p-5 border-b border-slate-100 flex justify-between items-start gap-3">
                <div>
                  <p className="text-[10px] font-extrabold text-teal-600 uppercase tracking-widest mb-1">
                    {CATEGORY_EMOJI[selected.category]}{' '}
                    {CATEGORY_LABEL[selected.category]}
                  </p>
                  <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                    Report Details
                  </h3>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-slate-400 hover:text-slate-900 text-lg leading-none"
                >
                  ✕
                </button>
              </div>

              <div className="p-5">
                <StatusBadge status={selected.status} />

                {selected.photoUrl && (
                  <img
                    src={selected.photoUrl}
                    alt="report"
                    className="w-full h-44 object-cover rounded-lg mt-4 border border-slate-100"
                  />
                )}

                <p className="text-sm text-slate-700 mt-4 leading-relaxed">
                  {selected.description}
                </p>

                <div className="mt-4 space-y-2 text-xs">
                  <InfoLine label="Address" value={selected.address || '—'} />
                  <InfoLine
                    label="Reported"
                    value={new Date(selected.createdAt).toLocaleString()}
                  />
                  {selected.reporterId?.name && (
                    <InfoLine label="Reported by" value={selected.reporterId.name} />
                  )}
                  <InfoLine label="Upvotes" value={selected.upvotes?.length || 0} />
                </div>

                <div className="border-t border-slate-100 pt-4 mt-5">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">
                    Change Status
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.filter((s) => s !== selected.status).map((s) => (
                      <button
                        key={s}
                        disabled={updating}
                        onClick={() => updateStatus(s)}
                        className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white rounded-md transition hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: STATUS_COLORS[s] }}
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleDelete}
                  className="w-full mt-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-extrabold py-2 rounded-md text-[10px] uppercase tracking-widest transition"
                >
                  Delete Report
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }) {
  const accentClass = {
    slate: 'text-slate-900',
    amber: 'text-amber-600',
    violet: 'text-violet-600',
    teal: 'text-teal-600',
  }[accent];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <p className={`text-3xl font-extrabold tracking-tight ${accentClass}`}>
        {value}
      </p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
        {label}
      </p>
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
        {label}
      </span>
      <span className="text-slate-700 font-semibold text-right truncate">
        {value}
      </span>
    </div>
  );
}