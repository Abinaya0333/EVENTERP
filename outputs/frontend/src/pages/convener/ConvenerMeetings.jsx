import DashboardLayout from '../../components/DashboardLayout';
import CrudPage from '../../components/CrudPage';
import { eventReportPage } from '../../lib/pageConfigs';
import { SectionHeader } from '../../components/Primitives';

export default function ConvenerMeetings() {
  return (
    <DashboardLayout
      title="Convener Meetings"
      subtitle="Close the loop with event reports, meeting notes, and the work that follows them."
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeader eyebrow="Reports" title="Meeting reports" description="Summaries from completed events and follow-up discussions." />
        <div className="mt-4">
          <CrudPage {...{ ...eventReportPage, title: 'Meeting reports', emptyTitle: 'No reports yet', allowDelete: false }} />
        </div>
      </section>
    </DashboardLayout>
  );
}
