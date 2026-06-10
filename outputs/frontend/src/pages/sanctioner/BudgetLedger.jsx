import { useEffect, useMemo, useState } from 'react';
<<<<<<< HEAD
import { Eye, RefreshCcw, Search, WalletCards } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import SanctionerLayout from '../../components/SanctionerLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { EmptyState, MiniButton, StatusPill, ToolbarInput } from '../../components/Primitives';
import { InfoBanner, MetricCard } from '../../components/SanctionerWidgets';
import { formatCurrency, groupExpensesByBudget, normalizeStatus, sumBy, unwrapList } from '../../lib/sanctioner';
=======
import SanctionerLayout from '../../components/SanctionerLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function money(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}
>>>>>>> ccb9f562e7b424c9b22862534d480c809f89c3d9

export default function BudgetLedger() {
  const { error: toastError } = useToast();
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  const [search, setSearch] = useState('');
  const [selectedBudgetId, setSelectedBudgetId] = useState(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let alive = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [budgetsResponse, expensesResponse] = await Promise.all([api.get('/budgets/'), api.get('/expenses/')]);
        if (!alive) return;
        setBudgets(unwrapList(budgetsResponse.data));
        setExpenses(unwrapList(expensesResponse.data));
      } catch (err) {
        console.error(err);
        toastError('Failed to load budget ledger');
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchData();

    return () => {
      alive = false;
    };
  }, [refreshIndex, toastError]);

  const rows = useMemo(() => {
    const grouped = groupExpensesByBudget(expenses);
    return budgets.map((budget) => {
      const budgetExpenses = grouped[budget.id] || [];
      const approvedBudget = Number(budget.approved_amount || 0);
      const actualExpense = sumBy(budgetExpenses, (item) => item.amount);
      const remaining = approvedBudget - actualExpense;
      return {
        ...budget,
        approvedBudget,
        actualExpense,
        remaining,
        expenses: budgetExpenses,
      };
    });
  }, [budgets, expenses]);

  useEffect(() => {
    if (!selectedBudgetId && rows.length) {
      setSelectedBudgetId(rows[0].id);
    } else if (selectedBudgetId && !rows.some((row) => row.id === selectedBudgetId) && rows.length) {
      setSelectedBudgetId(rows[0].id);
    }
  }, [rows, selectedBudgetId]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
  }, [rows, search]);

  const totals = useMemo(() => {
    const totalBudget = sumBy(rows, (row) => row.total_amount);
    const totalApproved = sumBy(rows, (row) => row.approvedBudget);
    const totalSpent = sumBy(rows, (row) => row.actualExpense);
    return {
      totalBudget,
      totalApproved,
      totalSpent,
      remaining: totalApproved - totalSpent,
    };
  }, [rows]);

  const selectedBudget = useMemo(
    () => rows.find((row) => row.id === selectedBudgetId) || rows[0] || null,
    [rows, selectedBudgetId],
  );

  return (
    <SanctionerLayout
      title="Budget Ledger"
      subtitle="Track approved budgets, actual spend, and the remaining balance for each event."
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
          badge="Ledger"
          title="Budgets and expenses are pulled live from the backend."
          description="Use the details panel to inspect line items for any event."
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Budget" value={formatCurrency(totals.totalBudget)} hint="All event budgets" icon={WalletCards} accentClassName="bg-[#0b3769]" />
          <MetricCard label="Total Approved" value={formatCurrency(totals.totalApproved)} hint="Approved budget amount" icon={WalletCards} accentClassName="bg-emerald-500" />
          <MetricCard label="Total Spent" value={formatCurrency(totals.totalSpent)} hint="Expenses recorded so far" icon={WalletCards} accentClassName="bg-rose-500" />
          <MetricCard label="Remaining" value={formatCurrency(totals.remaining)} hint="Approved minus spent" icon={WalletCards} accentClassName="bg-amber-500" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Budget Ledger</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">Event budgets</h2>
              </div>
              <div className="w-full lg:max-w-sm">
                <ToolbarInput
                  icon={Search}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search events or numbers"
                />
              </div>
            </div>

            <div className="px-5 py-4">
              {loading ? (
                <div className="flex min-h-[280px] items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : filteredRows.length ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Event</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Approved Budget</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Actual Expense</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Remaining</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status</th>
                        <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRows.map((row) => (
                        <tr key={row.id}>
                          <td className="px-3 py-4">
                            <p className="font-medium text-slate-900">{row.event_title || row.event?.title || `Budget #${row.id}`}</p>
                            <p className="mt-1 text-xs text-slate-500">Open the event expense breakdown on the right</p>
                          </td>
                          <td className="px-3 py-4 text-slate-700">{formatCurrency(row.approvedBudget)}</td>
                          <td className="px-3 py-4 text-slate-700">{formatCurrency(row.actualExpense)}</td>
                          <td className="px-3 py-4 text-slate-700">{formatCurrency(row.remaining)}</td>
                          <td className="px-3 py-4">
                            <StatusPill value={row.status} />
                          </td>
                          <td className="px-3 py-4">
                            <div className="flex items-center justify-end">
                              <MiniButton
                                icon={Eye}
                                label="Details"
                                onClick={() => setSelectedBudgetId(row.id)}
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
                  title="No budgets found"
                  description="Try a different search term or refresh the ledger."
                />
              )}
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Expense Breakdown</p>
              {selectedBudget ? (
                <div className="mt-4 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{selectedBudget.event_title || selectedBudget.event?.title || `Budget #${selectedBudget.id}`}</h3>
                    <p className="mt-1 text-sm text-slate-500">Detailed expense lines from the backend</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-50 px-3 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Approved</p>
                      <p className="mt-1 font-semibold text-slate-900">{formatCurrency(selectedBudget.approvedBudget)}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Spent</p>
                      <p className="mt-1 font-semibold text-slate-900">{formatCurrency(selectedBudget.actualExpense)}</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 px-3 py-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">Remaining</span>
                      <strong className="text-slate-900">{formatCurrency(selectedBudget.remaining)}</strong>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {selectedBudget.expenses.length ? (
                      selectedBudget.expenses.map((expense) => (
                        <div key={expense.id} className="rounded-xl border border-slate-200 px-3 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-900">{expense.title}</p>
                              <p className="mt-1 text-xs text-slate-500">{expense.category}</p>
                            </div>
                            <strong className="shrink-0 text-sm text-slate-900">{formatCurrency(expense.amount)}</strong>
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
                            <span>{expense.spent_by_name || expense.spent_by?.email || 'Recorded by system'}</span>
                            <span>{expense.date ? new Date(expense.date).toLocaleDateString() : '—'}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyState
                        title="No expenses yet"
                        description="This budget does not have expense entries yet."
                      />
                    )}
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="Select a budget"
                  description="Choose an event from the table to inspect its expense items."
                />
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Ledger Note</p>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                A negative remaining value means actual spend has crossed the approved budget. The details panel updates when you select a different event.
              </p>
            </section>
          </aside>
        </div>
      </div>
=======

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [budgetRes, expenseRes] = await Promise.all([api.get('/budgets/'), api.get('/expenses/')]);
        setBudgets(unwrapList(budgetRes.data));
        setExpenses(unwrapList(expenseRes.data));
      } finally {
        setLoading(false);
      }
    };
    load().catch(() => toastError('Unable to load budget ledger'));
  }, []);

  const approved = useMemo(() => budgets.filter((budget) => budget.status === 'APPROVED'), [budgets]);
  const spentByBudget = useMemo(() => {
    const map = new Map();
    expenses.forEach((expense) => map.set(expense.budget, (map.get(expense.budget) || 0) + Number(expense.amount || 0)));
    return map;
  }, [expenses]);
  const totalApproved = approved.reduce((sum, budget) => sum + Number(budget.approved_amount || budget.total_amount || 0), 0);
  const totalSpent = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const remaining = Math.max(0, totalApproved - totalSpent);

  return (
    <SanctionerLayout title="Budget Ledger">
      <h2 className="text-[32px] font-bold text-slate-950">Budget Ledger</h2>

      {loading ? (
        <div className="flex min-h-[320px] items-center justify-center"><LoadingSpinner /></div>
      ) : (
        <>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-100 bg-white p-8 shadow-sm"><div className="border-l-8 border-blue-500 pl-6"><p className="text-3xl font-bold">{money(totalApproved)}</p><p className="text-slate-500">Total Approved</p></div></div>
            <div className="rounded-xl border border-slate-100 bg-white p-8 shadow-sm"><div className="border-l-8 border-red-500 pl-6"><p className="text-3xl font-bold">{money(totalSpent)}</p><p className="text-slate-500">Total Spent</p></div></div>
            <div className="rounded-xl border border-slate-100 bg-white p-8 shadow-sm"><div className="border-l-8 border-emerald-500 pl-6"><p className="text-3xl font-bold">{money(remaining)}</p><p className="text-slate-500">Remaining</p></div></div>
          </div>

          <section className="mt-8 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-lg text-slate-600">
                <tr>
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Approved Budget</th>
                  <th className="px-6 py-4">Actual Expense</th>
                  <th className="px-6 py-4">Remaining</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {approved.length ? approved.map((budget) => {
                  const approvedAmount = Number(budget.approved_amount || budget.total_amount || 0);
                  const spent = spentByBudget.get(budget.id) || 0;
                  return (
                    <tr key={budget.id}>
                      <td className="px-6 py-5 font-semibold">{budget.event_title}</td>
                      <td className="px-6 py-5">{money(approvedAmount)}</td>
                      <td className="px-6 py-5">{money(spent)}</td>
                      <td className="px-6 py-5">{money(Math.max(0, approvedAmount - spent))}</td>
                      <td className="px-6 py-5"><span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">Approved</span></td>
                    </tr>
                  );
                }) : <tr><td className="px-6 py-16 text-center text-lg text-slate-400" colSpan="5">No approved events with budgets yet</td></tr>}
              </tbody>
            </table>
          </section>
        </>
      )}
>>>>>>> ccb9f562e7b424c9b22862534d480c809f89c3d9
    </SanctionerLayout>
  );
}
