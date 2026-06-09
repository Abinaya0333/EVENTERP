import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import SanctionerLayout from '../../components/SanctionerLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function levelName(level) {
  if (level === 2) return 'DEAN';
  if (level === 3) return 'PRINCIPAL';
  return 'HOD';
}

export default function ApprovalRequests() {
  const { profile } = useAuth();
  const { success, error: toastError } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const level = profile?.approval_level || 1;
  const label = levelName(level);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/approval-requests/', { params: { pending: 1 } });
      setItems(unwrapList(data));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => toastError('Unable to load approval requests'));
  }, []);

  const decide = async (item, action) => {
    const comment = window.prompt(action === 'approve' ? 'Approval comment (optional)' : 'Reason for rejection') || '';
    setSavingId(item.id);
    try {
      await api.post(`/approval-requests/${item.id}/${action}/`, { comment });
      success(action === 'approve' ? 'Approved and moved forward' : 'Rejected back to convener');
      await load();
    } catch {
      toastError('Unable to update approval');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <SanctionerLayout title={`Approval Requests — ${label}`}>
      <h2 className="text-[32px] font-bold text-slate-950">Approval Requests — {label}</h2>
      <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 px-5 py-4 text-lg text-blue-900">
        <span className="mr-4 rounded-full bg-yellow-100 px-4 py-2 text-sm font-bold text-[#073f73]">{label}</span>
        Showing events pending your approval at the <b>{label}</b> level.
      </div>

      <section className="mt-5 rounded-xl border border-slate-100 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center"><LoadingSpinner /></div>
        ) : items.length ? (
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <article key={item.id} className="p-6">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <h3 className="text-xl font-bold text-slate-950">{item.event_title}</h3>
                    <p className="mt-2 max-w-3xl text-slate-500">{item.event_description || 'No description provided.'}</p>
                    <p className="mt-2 text-sm font-medium text-slate-500">{item.event_location || 'Venue not set'}</p>
                  </div>
                  <div className="flex gap-3">
                    <button disabled={savingId === item.id} onClick={() => decide(item, 'approve')} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700 disabled:bg-slate-300">
                      <CheckCircle2 className="h-5 w-5" /> Approve
                    </button>
                    <button disabled={savingId === item.id} onClick={() => decide(item, 'reject')} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 disabled:bg-slate-300">
                      <XCircle className="h-5 w-5" /> Reject
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <CheckCircle2 className="h-16 w-16 text-slate-200" />
            <p className="mt-6 text-xl font-medium text-slate-600">No pending requests at your level.</p>
            <p className="mt-3 text-lg text-slate-400">Check back later or review approval history.</p>
          </div>
        )}
      </section>
    </SanctionerLayout>
  );
}
