import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BadgeCheck, Clock3, ListChecks, RefreshCcw, Search, XCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import SanctionerLayout from '../../components/SanctionerLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { EmptyState, MiniButton, ToolbarInput, StatusPill } from '../../components/Primitives';
import { InfoBanner, MetricCard } from '../../components/SanctionerWidgets';
import { formatCurrency, getSanctionerLevel, normalizeStatus, sumBy, unwrapList } from '../../lib/sanctioner';

function ApprovalStep({ label, active, count }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold ${
          active ? 'border-[#315a86] bg-[#315a86] text-white' : 'border-slate-200 bg-slate-50 text-slate-500'
        }`}
      >
        {count}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-400">{active ? 'Active stage' : 'Waiting stage'}</p>
      </div>
    </div>
  );
}

export default function ApprovalRequests() {
  const { profile } = useAuth();
  const level = getSanctionerLevel(profile);
  const { success, error: toastError } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshIndex, setRefreshIndex] = useState(0);

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
        toastError('Failed to load approval requests');
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchBudgets();

    return () => {
      alive = false;
    };
  }, [refreshIndex, toastError]);

  const pending = useMemo(
    () => items.filter((item) => normalizeStatus(item.status) === 'SUBMITTED'),
    [items],
  );

  const approved = useMemo(
    () => items.filter((item) => normalizeStatus(item.status) === 'APPROVED'),
    [items],
  );

  const rejected = useMemo(
    () => items.filter((item) => normalizeStatus(item.status) === 'REJECTED'),
    [items],
  );

  const filteredPending = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pending;
    return pending.filter((item) => JSON.stringify(item).toLowerCase().includes(q));
  }, [pending, search]);

  const totals = useMemo(() => {
    const totalBudget = sumBy(items, (item) => item.total_amount);
    const approvedBudget = sumBy(items, (item) => item.approved_amount);
    return {
      totalRequests: items.length,
      pending: pending.length,
      approved: approved.length,
      rejected: rejected.length,
      totalBudget,
      approvedBudget,
    };
  }, [approved.length, items, pending.length, rejected.length]);

  const handleAction = async (item, nextStatus) => {
    try {
      const payload =
        nextStatus === 'APPROVED'
          ? { status: nextStatus, approved_amount: item.total_amount }
          : { status: nextStatus, approved_amount: 0 };
      await api.patch(`/budgets/${item.id}/`, payload);
      success(`Budget ${nextStatus.toLowerCase()}`);
      setRefreshIndex((value) => value + 1);
    } catch (err) {
      console.error(err);
      toastError(err.response?.data?.detail || 'Unable to update approval');
    }
  };

  return (
    <SanctionerLayout
      title={`Approval Requests — ${level}`}
      subtitle={`Showing budgets pending your approval at the ${level} level.`}
      actions={
        <MiniButton
          icon={RefreshCcw}
          label="Refresh"
          onClick={() => setRefreshIndex((value) => value + 1)}
        />
      }
    >
      <div className="space-y-5">
        <InfoBanner
          badge={level}
          title={`Showing budgets pending your approval at the ${level} level.`}
          description="Approve or reject submitted budgets to move the event forward in the workflow."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Requests" value={totals.totalRequests} hint="All submitted budgets" icon={ListChecks} accentClassName="bg-[#0b3769]" />
          <MetricCard label="Pending" value={totals.pending} hint="Ready for review" icon={Clock3} accentClassName="bg-amber-500" />
          <MetricCard label="Approved" value={totals.approved} hint="Moved forward" icon={BadgeCheck} accentClassName="bg-emerald-500" />
          <MetricCard label="Rejected" value={totals.rejected} hint="Returned to convener" icon={XCircle} accentClassName="bg-rose-500" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Approval Queue</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">Submitted budgets</h2>
              </div>
              <div className="w-full lg:max-w-sm">
                <ToolbarInput
                  icon={Search}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search budgets or events"
                />
              </div>
            </div>

            <div className="px-5 py-4">
              {loading ? (
                <div className="flex min-h-[280px] items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : filteredPending.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Event</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Total Budget</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Approved</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status</th>
                        <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPending.map((item) => (
                        <tr key={item.id} className="align-top">
                          <td className="px-3 py-4">
                            <p className="font-medium text-slate-900">{item.event_title || item.event?.title || `Budget #${item.id}`}</p>
                            <p className="mt-1 text-xs text-slate-500">Budget request submitted for sanctioner review</p>
                          </td>
                          <td className="px-3 py-4 text-slate-700">{formatCurrency(item.total_amount)}</td>
                          <td className="px-3 py-4 text-slate-700">{formatCurrency(item.approved_amount)}</td>
                          <td className="px-3 py-4">
                            <StatusPill value={item.status} />
                          </td>
                          <td className="px-3 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <MiniButton
                                icon={BadgeCheck}
                                label="Approve"
                                variant="primary"
                                onClick={() => handleAction(item, 'APPROVED')}
                              />
                              <MiniButton
                                icon={XCircle}
                                label="Reject"
                                variant="danger"
                                onClick={() => handleAction(item, 'REJECTED')}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  title="No pending requests"
                  description="Submitted budgets will appear here once convener requests reach your level."
                />
              )}
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Approval Pipeline</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Workflow stages</h3>
              <div className="mt-5 space-y-4">
                <ApprovalStep label="Submitted" count={1} active={level === 'HOD'} />
                <div className="ml-5 h-6 w-px bg-slate-200" />
                <ApprovalStep label="HoD Approval" count={2} active={level === 'HOD'} />
                <div className="ml-5 h-6 w-px bg-slate-200" />
                <ApprovalStep label="Dean Approval" count={3} active={level === 'DEAN'} />
                <div className="ml-5 h-6 w-px bg-slate-200" />
                <ApprovalStep label="Principal Approval" count={4} active={level === 'PRINCIPAL'} />
                <div className="ml-5 h-6 w-px bg-slate-200" />
                <ApprovalStep label="Approved" count={5} active={false} />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Budget Snapshot</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between gap-3">
                  <span>Total budget</span>
                  <strong className="text-slate-900">{formatCurrency(totals.totalBudget)}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Approved amount</span>
                  <strong className="text-slate-900">{formatCurrency(totals.approvedBudget)}</strong>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Pending approval</span>
                  <strong className="text-slate-900">{totals.pending}</strong>
                </div>
              </div>
              <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[#315a86]" />
                  <p>Approve or reject budgets here and the history view will update automatically after refresh.</p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </SanctionerLayout>
  );
}
