import { useEffect, useState } from 'react';
import { CheckCircle2, PlayCircle } from 'lucide-react';
import ConvenerLayout from '../../components/ConvenerLayout';
import CrudPage from '../../components/CrudPage';
import { createApiAction, eventPage } from '../../lib/pageConfigs';
import { SectionHeader, StatCard } from '../../components/Primitives';
import api from '../../services/api';

const config = {
  ...eventPage,
  allowDelete: false,
  rowActions: [
    createApiAction({
      label: 'Approve',
      variant: 'primary',
      icon: CheckCircle2,
      handler: async (item, { api, toastSuccess }) => {
        await api.post(`/events/${item.id}/approve/`);
        toastSuccess?.('Event approved');
      },
    }),
    createApiAction({
      label: 'Complete',
      variant: 'default',
      icon: PlayCircle,
      handler: async (item, { api, toastSuccess }) => {
        await api.post(`/events/${item.id}/complete/`);
        toastSuccess?.('Event completed');
      },
    }),
  ],
};

export default function ExecutePanel() {
  const [stats, setStats] = useState({ approved: 0, pending: 0, budgets: 0 });

  useEffect(() => {
    let alive = true;
    Promise.all([api.get('/events/'), api.get('/budgets/')]).then(([eventsRes, budgetsRes]) => {
      if (!alive) return;
      const events = eventsRes.data?.results || eventsRes.data || [];
      const budgets = budgetsRes.data?.results || budgetsRes.data || [];
      setStats({
        approved: events.filter((event) => String(event.status).toUpperCase() === 'APPROVED').length,
        pending: events.filter((event) => String(event.status).toUpperCase() === 'PENDING').length,
        budgets: budgets.filter((budget) => String(budget.status).toUpperCase() === 'SUBMITTED').length,
      });
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <ConvenerLayout
      title="Execute Panel"
      subtitle="Push events through approval and completion while keeping the operational picture visible."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Approved" value={stats.approved} hint="Events ready to run" />
        <StatCard label="Pending" value={stats.pending} hint="Waiting for approval" tone="amber" />
        <StatCard label="Submitted budgets" value={stats.budgets} hint="Budget requests pending review" tone="emerald" />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeader eyebrow="Workflow" title="Event controls" description="Approve, complete, or edit the event pipeline from one panel." />
        <div className="mt-4">
          <CrudPage {...config} />
        </div>
      </section>
    </ConvenerLayout>
  );
}
