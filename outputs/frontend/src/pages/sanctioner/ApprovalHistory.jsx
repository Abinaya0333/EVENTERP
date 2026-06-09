import { useEffect, useMemo, useState } from 'react';
import SanctionerLayout from '../../components/SanctionerLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : '-';
}

const tabs = ['ALL', 'APPROVED', 'REJECTED', 'SENT_BACK'];

export default function ApprovalHistory() {
  const { error: toastError } = useToast();
  const [items, setItems] = useState([]);
  const [active, setActive] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/approval-requests/');
        setItems(unwrapList(data));
      } finally {
        setLoading(false);
      }
    };
    load().catch(() => toastError('Unable to load approval history'));
  }, []);

  const decided = useMemo(() => items.filter((item) => item.decision !== 'PENDING'), [items]);
  const visible = active === 'ALL' ? decided : decided.filter((item) => item.decision === active);

  return (
    <SanctionerLayout title="Approval History">
      <h2 className="text-[32px] font-bold text-slate-950">Approval History</h2>
      <div className="mt-8 flex gap-4">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActive(tab)} className={`rounded-full px-6 py-3 text-lg font-bold ${active === tab ? 'bg-[#073f73] text-white' : 'bg-white text-slate-600'}`}>
            {tab === 'ALL' ? 'All' : tab.replace('_', ' ')} ({tab === 'ALL' ? decided.length : decided.filter((item) => item.decision === tab).length})
          </button>
        ))}
      </div>
      <section className="mt-5 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        {loading ? <div className="flex min-h-[220px] items-center justify-center"><LoadingSpinner /></div> : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-lg text-slate-600">
              <tr>
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">Level</th>
                <th className="px-6 py-4">Decision</th>
                <th className="px-6 py-4">By</th>
                <th className="px-6 py-4">Comment</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.length ? visible.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-5 font-semibold">{item.event_title}</td>
                  <td className="px-6 py-5">{item.level}</td>
                  <td className="px-6 py-5">{item.decision}</td>
                  <td className="px-6 py-5">{item.decided_by_name || '-'}</td>
                  <td className="px-6 py-5">{item.comment || '-'}</td>
                  <td className="px-6 py-5">{formatDate(item.decided_at)}</td>
                </tr>
              )) : <tr><td className="px-6 py-16 text-center text-lg text-slate-400" colSpan="6">No approval history found</td></tr>}
            </tbody>
          </table>
        )}
      </section>
    </SanctionerLayout>
  );
}
