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

function money(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

export default function BudgetLedger() {
  const { error: toastError } = useToast();
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

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
    </SanctionerLayout>
  );
}
