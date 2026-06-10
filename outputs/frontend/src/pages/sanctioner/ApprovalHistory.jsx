import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, Search, XCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import SanctionerLayout from '../../components/SanctionerLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { EmptyState, StatusPill, ToolbarInput } from '../../components/Primitives';
import { InfoBanner, MetricCard } from '../../components/SanctionerWidgets';
import { formatCurrency, normalizeStatus, sumBy, unwrapList } from '../../lib/sanctioner';

const FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: 'SUBMITTED', label: 'Pending' },
];

export default function ApprovalHistory() {
  const { error: toastError } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    let alive = true;

    const fetchBudgets = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/budgets/');
        if (alive) {
          setItems(unwrapList(data));
        }
      } catch (err) {
        console.error(err);
        toastError('Failed to load approval history');
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchBudgets();

    return () => {
      alive = false;
    };
  }, [toastError]);

  const counts = useMemo(() => {
    const approved = items.filter((item) => normalizeStatus(item.status) === 'APPROVED');
    const rejected = items.filter((item) => normalizeStatus(item.status) === 'REJECTED');
    const pending = items.filter((item) => normalizeStatus(item.status) === 'SUBMITTED');
    return {
      total: items.length,
      approved: approved.length,
      rejected: rejected.length,
      pending: pending.length,
      approvedAmount: sumBy(approved, (item) => item.approved_amount),
    };
  }, [items]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = items;

    if (activeFilter !== 'ALL') {
      list = list.filter((item) => normalizeStatus(item.status) === activeFilter);
    }

    if (q) {
      list = list.filter((item) => JSON.stringify(item).toLowerCase().includes(q));
    }

    return list;
  }, [activeFilter, items, search]);

  return (
    <SanctionerLayout
      title="Approval History"
      subtitle="Review budgets that have already moved through the approval queue."
    >
      <div className="space-y-5">
        <InfoBanner
          badge="History"
          title="Approval records stay visible here after every decision."
          description="Use the tabs to switch between approved, rejected, and pending records."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="All Records" value={counts.total} hint="Budgets currently in the system" icon={Clock3} accentClassName="bg-[#0b3769]" />
          <MetricCard label="Approved" value={counts.approved} hint="Approved budgets" icon={CheckCircle2} accentClassName="bg-emerald-500" />
          <MetricCard label="Rejected" value={counts.rejected} hint="Rejected budgets" icon={XCircle} accentClassName="bg-rose-500" />
          <MetricCard label="Approved Value" value={formatCurrency(counts.approvedAmount)} hint="Cumulative approved amount" icon={Clock3} accentClassName="bg-amber-500" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Approval History</p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">Audit trail</h2>
                </div>
                <div className="w-full lg:max-w-sm">
                  <ToolbarInput
                    icon={Search}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search events or amounts"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {FILTERS.map((filter) => {
                  const count =
                    filter.key === 'ALL'
                      ? counts.total
                      : filter.key === 'APPROVED'
                        ? counts.approved
                        : filter.key === 'REJECTED'
                          ? counts.rejected
                          : counts.pending;

                  const active = activeFilter === filter.key;
                  return (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => setActiveFilter(filter.key)}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                        active ? 'bg-[#0b3769] text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>{filter.label}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${active ? 'bg-white/20 text-white' : 'bg-white text-slate-500'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-5 py-4">
              {loading ? (
                <div className="flex min-h-[280px] items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : rows.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Event</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Total</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Approved</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rows.map((item) => (
                        <tr key={item.id}>
                          <td className="px-3 py-4">
                            <p className="font-medium text-slate-900">{item.event_title || item.event?.title || `Budget #${item.id}`}</p>
                            <p className="mt-1 text-xs text-slate-500">Updated approval record</p>
                          </td>
                          <td className="px-3 py-4 text-slate-700">{formatCurrency(item.total_amount)}</td>
                          <td className="px-3 py-4 text-slate-700">{formatCurrency(item.approved_amount)}</td>
                          <td className="px-3 py-4">
                            <StatusPill value={item.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  title="No history found"
                  description="Try a different filter or search term."
                />
              )}
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Review Summary</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-3">
                  <span>Approved records</span>
                  <strong className="text-slate-900">{counts.approved}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Rejected records</span>
                  <strong className="text-slate-900">{counts.rejected}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Pending records</span>
                  <strong className="text-slate-900">{counts.pending}</strong>
                </div>
              </div>
              <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                Keep this page open when you need to trace back a decision or verify the approved amount.
              </div>
            </section>
          </aside>
        </div>
      </div>
    </SanctionerLayout>
  );
}
