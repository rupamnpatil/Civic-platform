import React, { useEffect, useState } from 'react';
import client from '../api/client';

const PRIORITIES = [
  { id: 'normal', label: 'Info', color: '#2563EB', bg: '#DBEAFE' },
  { id: 'important', label: 'Important', color: '#D97706', bg: '#FEF3C7' },
  { id: 'urgent', label: 'Urgent', color: '#DC2626', bg: '#FEE2E2' },
];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState('normal');
  const [expiresAt, setExpiresAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const res = await client.get('/announcements');
      setAnnouncements(res.data.announcements || []);
    } catch (err) { console.log(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    try {
      await client.post('/announcements', {
        title: title.trim(),
        body: body.trim(),
        priority,
        expiresAt: expiresAt || null,
      });
      setTitle(''); setBody(''); setPriority('normal'); setExpiresAt('');
      fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await client.delete(`/announcements/${id}`);
      setAnnouncements((prev) => prev.filter((a) => a._id !== id));
    } catch { alert('Delete failed'); }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        <p className="text-[10px] font-extrabold text-teal-600 uppercase tracking-widest mb-1">
          Municipal
        </p>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          City Announcements
        </h1>
        <p className="text-sm text-slate-500 mt-1 mb-8">
          Broadcast alerts to citizens in real-time.
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-slate-200 p-6 mb-8"
        >
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest mb-5">
            Create Announcement
          </h2>

          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Water supply maintenance"
            maxLength={120}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 mb-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
            required
          />

          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
            Message
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Describe the announcement…"
            rows={3}
            maxLength={1000}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 mb-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
            required
          />

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Expires At (optional)
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold py-3 rounded-lg text-xs uppercase tracking-widest transition"
          >
            {submitting ? 'Publishing…' : 'Publish Announcement'}
          </button>
        </form>

        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">
          Active ({announcements.length})
        </p>

        {loading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : announcements.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
            <p className="text-sm text-slate-400">No announcements yet.</p>
          </div>
        ) : (
          announcements.map((a) => {
            const p = PRIORITIES.find((x) => x.id === a.priority) || PRIORITIES[0];
            return (
              <div
                key={a._id}
                className="bg-white rounded-xl border border-slate-200 p-4 mb-3 flex gap-4"
              >
                <div
                  className="w-1 rounded-full shrink-0"
                  style={{ backgroundColor: p.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded"
                      style={{ color: p.color, backgroundColor: p.bg }}
                    >
                      {p.label}
                    </span>
                    {a.authorityId?.name && (
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {a.authorityId.name}
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{a.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{a.body}</p>
                  <p className="text-[10px] text-slate-400 mt-2 font-semibold uppercase tracking-wider">
                    {new Date(a.createdAt).toLocaleString()}
                    {a.expiresAt && ` · Expires ${new Date(a.expiresAt).toLocaleString()}`}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(a._id)}
                  className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest self-start transition"
                >
                  Delete
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}