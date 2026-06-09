import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, Search } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function badgeClass(decision) {
  const value = String(decision || '').toUpperCase();
  if (value === 'APPROVED') return 'bg-emerald-50 text-emerald-700';
  if (value === 'REJECTED') return 'bg-rose-50 text-rose-700';
  if (value === 'SENT_BACK') return 'bg-amber-50 text-amber-700';
  return 'bg-slate-100 text-slate-700';
}

export default function AuditLogs() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/approval-requests/');
      setRequests(unwrapList(data));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    return requests
      .filter((item) => {
        const text = `${item.event_title || item.event || ''} ${item.comment || ''} ${item.decided_by_name || ''}`.toLowerCase();
        const matchesQuery = !query.trim() || text.includes(query.toLowerCase());
        const matchesStatus = status === 'ALL' || String(item.decision || '').toUpperCase() === status;
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => new Date(b.decided_at || b.created_at) - new Date(a.decided_at || a.created_at));
  }, [requests, query, status]);

  return (
    <AdminLayout title="Audit Logs">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-[32px] font-bold text-slate-950">Approval Activity</h2>
          <p className="mt-2 max-w-3xl text-base text-slate-600">
            Live history from the 3-level approval flow. This is the backend-backed audit stream for admin review.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SENT_BACK'].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setStatus(item)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              status === item ? 'bg-[#073f73] text-white' : 'bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {item}
          </button>
        ))}
        <div className="ml-auto min-w-[280px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search event, approver, comment..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-[#073f73]"
            />
          </div>
        </div>
      </div>

      <section className="mt-8 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : filtered.length ? (
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-lg text-slate-600">
              <tr>
                <th className="px-6 py-4 font-bold">Event</th>
                <th className="px-6 py-4 font-bold">Level</th>
                <th className="px-6 py-4 font-bold">Decision</th>
                <th className="px-6 py-4 font-bold">By</th>
                <th className="px-6 py-4 font-bold">Comment</th>
                <th className="px-6 py-4 font-bold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-5">
                    <p className="text-lg font-semibold text-slate-800">{item.event_title || item.event || 'Unknown event'}</p>
                  </td>
                  <td className="px-6 py-5 text-lg text-slate-600">Level {item.level || '-'}</td>
                  <td className="px-6 py-5">
                    <span className={`rounded-full px-3 py-1 text-sm font-bold ${badgeClass(item.decision)}`}>{item.decision || 'PENDING'}</span>
                  </td>
                  <td className="px-6 py-5 text-lg text-slate-600">{item.decided_by_name || '-'}</td>
                  <td className="px-6 py-5 text-slate-600">{item.comment || '—'}</td>
                  <td className="px-6 py-5 text-slate-600">
                    {new Date(item.decided_at || item.created_at).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <ClipboardList className="h-12 w-12 text-slate-300" />
            <p className="mt-4 text-lg font-semibold text-slate-700">No approval activity yet</p>
            <p className="mt-2 max-w-md text-sm text-slate-500">Once events move through HoD, Dean, and Principal approvals, the history will appear here.</p>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
