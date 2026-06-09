import { useEffect, useState } from 'react';
import { FileClock, Bell } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import { EmptyState, SectionHeader, StatusPill } from '../../components/Primitives';
import api from '../../services/api';
import { formatDateTime } from '../../components/Shared';

export default function AuditLogs() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const [notificationsRes, reportsRes] = await Promise.all([api.get('/notifications/'), api.get('/event-reports/')]);
      const notifications = (notificationsRes.data?.results || notificationsRes.data || []).map((item) => ({
        id: `n-${item.id}`,
        type: 'Notification',
        title: item.message,
        status: item.is_read ? 'Read' : 'Unread',
        date: item.created_at,
      }));
      const reports = (reportsRes.data?.results || reportsRes.data || []).map((item) => ({
        id: `r-${item.id}`,
        type: 'Report',
        title: item.report,
        status: 'Logged',
        date: item.created_at,
      }));
      if (alive) setItems([...notifications, ...reports].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 25));
    };
    load().catch(console.error);
    return () => {
      alive = false;
    };
  }, []);

  return (
    <DashboardLayout title="Audit Logs" subtitle="A lightweight audit stream built from the live notifications and reports API.">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeader eyebrow="Log" title="Activity stream" description="Recent notifications and event reports in chronological order." />
        {items.length ? (
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <StatusPill value={item.type} />
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.type}</p>
                  </div>
                  <p className="mt-2 text-sm font-medium text-slate-900">{item.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">{formatDateTime(item.date)}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-700">{item.status}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={FileClock} title="No audit activity" description="Notifications and reports will appear here once the workflow is in use." />
        )}
      </section>
    </DashboardLayout>
  );
}
