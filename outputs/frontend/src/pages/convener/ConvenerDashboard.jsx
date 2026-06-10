import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BellRing, CalendarDays, ClipboardList, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConvenerLayout from '../../components/ConvenerLayout';
import { EmptyState, MiniButton, SectionHeader, StatCard, StatusPill } from '../../components/Primitives';
import { formatDateTime } from '../../components/Shared';
import api from '../../services/api';

function unwrap(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function money(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number.isNaN(amount) ? 0 : amount);
}

function sum(items, key) {
  return items.reduce((total, item) => total + Number(item?.[key] || 0), 0);
}

export default function ConvenerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      try {
        const [eventsRes, registrationsRes, budgetsRes, expensesRes, notificationsRes] = await Promise.all([
          api.get('/events/'),
          api.get('/registrations/'),
          api.get('/budgets/'),
          api.get('/expenses/'),
          api.get('/notifications/'),
        ]);

        if (!alive) return;
        setEvents(unwrap(eventsRes.data));
        setRegistrations(unwrap(registrationsRes.data));
        setBudgets(unwrap(budgetsRes.data));
        setExpenses(unwrap(expensesRes.data));
        setNotifications(unwrap(notificationsRes.data));
      } catch (error) {
        console.error(error);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, []);

  const now = useMemo(() => new Date(), []);
  const upcomingEvents = useMemo(
    () =>
      events
        .filter((event) => String(event.status).toUpperCase() === 'APPROVED' && new Date(event.start_date) >= now)
        .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
        .slice(0, 5),
    [events, now],
  );
  const recentEvents = useMemo(() => events.slice(0, 5), [events]);

  const stats = useMemo(() => {
    const totalBudget = sum(budgets, 'total_amount');
    const totalSpent = sum(expenses, 'amount');
    return {
      totalEvents: events.length,
      pendingApprovals: events.filter((event) => String(event.status).toUpperCase() === 'PENDING').length,
      approvedEvents: events.filter((event) => String(event.status).toUpperCase() === 'APPROVED').length,
      upcomingEvents: upcomingEvents.length,
      registrations: registrations.length,
      budgetTotal: totalBudget,
      budgetSpent: totalSpent,
      budgetRemaining: Math.max(totalBudget - totalSpent, 0),
    };
  }, [budgets, events, expenses, upcomingEvents.length, registrations.length]);

  const pipeline = [
    { label: 'Draft', value: events.filter((event) => String(event.status).toUpperCase() === 'DRAFT').length, tone: 'slate' },
    { label: 'Pending', value: stats.pendingApprovals, tone: 'amber' },
    { label: 'Approved', value: stats.approvedEvents, tone: 'emerald' },
    { label: 'Completed', value: events.filter((event) => String(event.status).toUpperCase() === 'COMPLETED').length, tone: 'blue' },
  ];

  return (
    <ConvenerLayout
      title="Dashboard"
      subtitle="Track event creation, approval status, live registrations, and the operational work that follows."
    >
      <div className="flex flex-wrap gap-2">
        <MiniButton icon={Sparkles} label="Create Event" variant="primary" onClick={() => navigate('/convener/create')} />
        <MiniButton icon={ClipboardList} label="Registration Template" onClick={() => navigate('/convener/form-template')} />
        <MiniButton icon={ArrowRight} label="Live Registration" onClick={() => navigate('/convener/live')} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Events" value={loading ? '...' : stats.totalEvents} hint="All convener-owned records" icon={CalendarDays} />
        <StatCard label="Pending Approvals" value={loading ? '...' : stats.pendingApprovals} hint="Awaiting review" icon={BellRing} tone="amber" />
        <StatCard label="Approved Events" value={loading ? '...' : stats.approvedEvents} hint="Ready for participants" icon={Sparkles} tone="emerald" />
        <StatCard label="Upcoming Events" value={loading ? '...' : stats.upcomingEvents} hint="Approved and not yet started" icon={CalendarDays} tone="teal" />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeader
          eyebrow="Pipeline"
          title="Event approval flow"
          description="The current status of the convener-owned event pipeline."
        />
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {pipeline.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeader
            eyebrow="Requests"
            title="Recent event requests"
            description="Events created by the convener and their current operational state."
          />
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Event</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Starts</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentEvents.length ? (
                  recentEvents.map((event) => (
                    <tr key={event.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <div>{event.title}</div>
                        <div className="mt-1 text-xs text-slate-500">{event.registrations_count || 0} registrations</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{event.department_name || event.department || '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDateTime(event.start_date)}</td>
                      <td className="px-4 py-3"><StatusPill value={event.status} /></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-8">
                      <EmptyState
                        title="No events yet"
                        description="Create the first event to start the workflow."
                        action={<MiniButton icon={Sparkles} label="Create Event" variant="primary" onClick={() => navigate('/convener/create')} />}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeader eyebrow="Finance" title="Budget snapshot" description="Budgeted, spent, and remaining amounts across the convener portfolio." />
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Approved budget</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{money(stats.budgetTotal)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Spent</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{money(stats.budgetSpent)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Remaining</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{money(stats.budgetRemaining)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeader eyebrow="Alerts" title="Notifications" description="Recent operational notes and workflow messages." />
            <div className="mt-4 space-y-3">
              {notifications.length ? (
                notifications.slice(0, 5).map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{item.message}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.type || 'notice'}
                          {item.created_at ? ` • ${formatDateTime(item.created_at)}` : ''}
                        </p>
                      </div>
                      <StatusPill value={item.is_read ? 'Read' : 'Unread'} />
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState title="No notifications" description="Alerts will appear here as the workflow advances." icon={BellRing} />
              )}
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeader
          eyebrow="Timeline"
          title="Upcoming events"
          description="Approved events scheduled next, so you can open registration and coordinate the team."
        />
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Event</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Venue</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Start</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {upcomingEvents.length ? (
                upcomingEvents.map((event) => (
                  <tr key={event.id}>
                    <td className="px-4 py-3 font-medium text-slate-900">{event.title}</td>
                    <td className="px-4 py-3 text-slate-600">{event.location || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDateTime(event.start_date)}</td>
                    <td className="px-4 py-3"><StatusPill value={event.status} /></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-slate-500">
                    No approved upcoming events yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </ConvenerLayout>
  );
}
