import { useEffect, useState } from 'react';
import { ArrowRight, Building2, Clock3, UsersRound, WalletCards, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { MiniButton, SectionHeader, StatCard, StatusPill } from '../../components/Primitives';
import api from '../../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    departments: 0,
    events: 0,
    approvals: 0,
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      try {
        const [usersRes, deptsRes, eventsRes, budgetsRes] = await Promise.all([
          api.get('/users/'),
          api.get('/departments/'),
          api.get('/events/'),
          api.get('/budgets/'),
        ]);
        const users = usersRes.data?.count ?? usersRes.data?.length ?? 0;
        const depts = deptsRes.data?.count ?? deptsRes.data?.length ?? 0;
        const events = eventsRes.data?.count ?? eventsRes.data?.length ?? 0;
        const budgets = (budgetsRes.data?.results || budgetsRes.data || []).filter((budget) => {
          const status = String(budget.status || '').toUpperCase();
          return status === 'SUBMITTED' || status === 'PENDING';
        }).length;
        if (!alive) return;
        setStats({ users, departments: depts, events, approvals: budgets });
        setRecentEvents((eventsRes.data?.results || eventsRes.data || []).slice(0, 5));
        setRecentUsers((usersRes.data?.results || usersRes.data || []).slice(0, 5));
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle="Monitor the platform, manage access, and keep departments, users, and events aligned."
      actions={
        <MiniButton icon={ArrowRight} label="Open users" variant="primary" onClick={() => navigate('/admin/users')} />
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Users" value={loading ? '...' : stats.users} hint="Accounts in the system" icon={UsersRound} />
        <StatCard label="Departments" value={loading ? '...' : stats.departments} hint="Linked academic units" icon={Building2} tone="teal" />
        <StatCard label="Events" value={loading ? '...' : stats.events} hint="Created event records" icon={ClipboardList} tone="amber" />
        <StatCard label="Pending approvals" value={loading ? '...' : stats.approvals} hint="Budgets waiting on review" icon={WalletCards} tone="emerald" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.8fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeader
            eyebrow="Activity"
            title="Recent events"
            description="A quick look at the latest records flowing through the platform."
          />
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Event</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentEvents.length ? (
                  recentEvents.map((event) => (
                    <tr key={event.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">{event.title}</td>
                      <td className="px-4 py-3 text-slate-600">{event.location || '-'}</td>
                      <td className="px-4 py-3"><StatusPill value={event.status} /></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-4 py-8 text-center text-slate-500">No events yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeader eyebrow="Users" title="Recent accounts" description="Fresh logins and newly created profiles." />
          <div className="mt-4 space-y-3">
            {recentUsers.length ? (
              recentUsers.map((user) => (
                <div key={user.id} className="rounded-2xl border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{user.name || user.email}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                    <StatusPill value={user.role} />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No users to show yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
