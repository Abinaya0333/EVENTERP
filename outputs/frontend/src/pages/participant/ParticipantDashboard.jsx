import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpenCheck, ClipboardList, MessageSquareText, RefreshCcw } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-[#0b3769]">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0b3769] text-white">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function ParticipantDashboard() {
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      try {
        const [registrationRes, eventRes, certificateRes] = await Promise.all([
          api.get('/registrations/'),
          api.get('/events/'),
          api.get('/certificates/'),
        ]);
        if (!alive) return;
        setRegistrations(unwrapList(registrationRes.data));
        setEvents(unwrapList(eventRes.data));
        setCertificates(unwrapList(certificateRes.data));
      } finally {
        if (alive) setLoading(false);
      }
    };

    load().catch(() => setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const upcomingEvents = useMemo(
    () => events.filter((event) => !event.status || ['APPROVED', 'PUBLISHED', 'OPEN'].includes(event.status)),
    [events],
  );

  return (
    <DashboardLayout title="Dashboard" subtitle="Your event activity overview.">
      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="My Registrations" value={registrations.length} icon={ClipboardList} />
            <StatCard label="Events Available" value={upcomingEvents.length} icon={BookOpenCheck} />
            <StatCard label="Certificates" value={certificates.length} icon={MessageSquareText} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-semibold text-[#0b3769]">Recent Registrations</h2>
                <Link className="text-sm font-medium text-[#0b3769] hover:underline" to="/participant/registrations">
                  View all
                </Link>
              </div>
              <div className="min-h-[120px] px-5 py-6 text-sm text-slate-500">
                {registrations.length ? (
                  registrations.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
                      <span>{item.event_title || item.event?.title || 'Event'}</span>
                      <span className="font-medium text-slate-700">{item.status || 'Registered'}</span>
                    </div>
                  ))
                ) : (
                  <p>No registrations yet. <Link className="text-[#0b3769] underline" to="/participant/events">Browse events</Link></p>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-semibold text-[#0b3769]">Quick Actions</h2>
                <RefreshCcw className="h-4 w-4 text-slate-400" />
              </div>
              <div className="grid gap-3 p-5 sm:grid-cols-2">
                <Link className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-[#0b3769] hover:bg-slate-50" to="/participant/events">
                  Browse Events
                </Link>
                <Link className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-[#0b3769] hover:bg-slate-50" to="/participant/feedback">
                  Feedback & Certificate
                </Link>
              </div>
            </section>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
