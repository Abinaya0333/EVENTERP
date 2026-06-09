import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckSquare, Clock, TrendingUp, UsersRound } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function StatCard({ label, value, icon: Icon, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    teal: 'bg-teal-50 text-teal-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  };
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-8 shadow-sm">
      <div className="flex items-center gap-5">
        <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-7 w-7" />
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-950">{value}</p>
          <p className="text-lg text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      try {
        const [usersRes, eventsRes, registrationsRes] = await Promise.all([
          api.get('/users/'),
          api.get('/events/'),
          api.get('/registrations/'),
        ]);
        if (!alive) return;
        setUsers(unwrapList(usersRes.data));
        setEvents(unwrapList(eventsRes.data));
        setRegistrations(unwrapList(registrationsRes.data));
      } finally {
        if (alive) setLoading(false);
      }
    };
    load().catch(() => setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const roleCounts = useMemo(() => {
    const counts = {};
    users.forEach((user) => {
      const role = user.role || 'UNKNOWN';
      counts[role] = (counts[role] || 0) + 1;
    });
    return counts;
  }, [users]);

  const approvedEvents = events.filter((event) => event.status === 'APPROVED').length;
  const pendingEvents = events.filter((event) => event.status === 'PENDING').length;

  return (
    <AdminLayout title="Admin Dashboard">
      <h2 className="text-[32px] font-bold text-slate-950">Admin Dashboard</h2>

      {loading ? (
        <div className="flex min-h-[360px] items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <StatCard label="Total Users" value={users.length} icon={UsersRound} />
            <StatCard label="Total Events" value={events.length} icon={CalendarDays} tone="green" />
            <StatCard label="Registrations" value={registrations.length} icon={CheckSquare} tone="teal" />
            <StatCard label="Approved Events" value={approvedEvents} icon={CheckSquare} tone="green" />
            <StatCard label="Pending Approvals" value={pendingEvents} icon={Clock} tone="yellow" />
            <StatCard label="System Health" value="Online" icon={TrendingUp} tone="green" />
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-xl border border-slate-100 bg-white p-8 shadow-sm">
              <h3 className="flex items-center gap-2 text-xl font-bold text-slate-950"><CalendarDays className="h-5 w-5" /> Recent Events</h3>
              <div className="mt-6 space-y-3">
                {events.slice(0, 5).length ? events.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3">
                    <div>
                      <p className="font-semibold text-slate-900">{event.title}</p>
                      <p className="text-sm text-slate-500">{event.location || 'No venue'}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{event.status}</span>
                  </div>
                )) : <p className="text-lg text-slate-400">No events yet</p>}
              </div>
            </section>

            <section className="rounded-xl border border-slate-100 bg-white p-8 shadow-sm">
              <h3 className="flex items-center gap-2 text-xl font-bold text-slate-950"><UsersRound className="h-5 w-5" /> Users by Role</h3>
              <div className="mt-6 space-y-4">
                {Object.entries(roleCounts).map(([role, count]) => {
                  const percent = users.length ? Math.max(8, (count / users.length) * 100) : 0;
                  return (
                    <div key={role} className="grid grid-cols-[160px_1fr_30px] items-center gap-4">
                      <span className="text-sm font-medium text-slate-600">{role.replace('_', ' ')}</span>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-[#073f73]" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="text-right font-semibold text-slate-700">{count}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
