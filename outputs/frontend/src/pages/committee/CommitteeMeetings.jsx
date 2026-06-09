import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import CrudPage from '../../components/CrudPage';
import { eventReportPage, taskPage } from '../../lib/pageConfigs';
import api from '../../services/api';
import { EmptyState, SectionHeader, StatCard } from '../../components/Primitives';
import { CalendarClock, FileClock, ListChecks } from 'lucide-react';

export default function CommitteeMeetings() {
  const [summary, setSummary] = useState({ reports: 0, tasks: 0, committees: 0 });

  useEffect(() => {
    let alive = true;
    Promise.all([api.get('/event-reports/'), api.get('/tasks/'), api.get('/committees/')]).then(([reports, tasks, committees]) => {
      if (!alive) return;
      setSummary({
        reports: reports.data?.count ?? (reports.data?.results || reports.data || []).length,
        tasks: tasks.data?.count ?? (tasks.data?.results || tasks.data || []).length,
        committees: committees.data?.count ?? (committees.data?.results || committees.data || []).length,
      });
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <DashboardLayout title="Committee Meetings" subtitle="Track agendas, discussion notes, and follow-up work for committee operations.">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Reports" value={summary.reports} hint="Meeting notes and close-out reports" icon={FileClock} />
        <StatCard label="Tasks" value={summary.tasks} hint="Open committee actions" icon={ListChecks} tone="teal" />
        <StatCard label="Committees" value={summary.committees} hint="Defined event committees" icon={CalendarClock} tone="amber" />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeader eyebrow="Reports" title="Recent event reports" description="These form the basis of meeting discussion and close-out notes." />
        <div className="mt-4">
          <CrudPage {...{ ...eventReportPage, allowCreate: false, allowEdit: false, allowDelete: false, fields: [], title: 'Reports' }} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeader eyebrow="Tasks" title="Current task board" description="Work items assigned to the committee." />
        <div className="mt-4">
          <CrudPage {...{ ...taskPage, allowCreate: false, allowEdit: false, allowDelete: false, fields: [], title: 'Tasks' }} />
        </div>
      </section>
    </DashboardLayout>
  );
}
