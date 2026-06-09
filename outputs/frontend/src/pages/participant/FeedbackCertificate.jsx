import CrudPage from '../../components/CrudPage';
import DashboardLayout from '../../components/DashboardLayout';
import { certificatePage, feedbackPage } from '../../lib/pageConfigs';
import { SectionHeader } from '../../components/Primitives';

export default function FeedbackCertificate() {
  return (
    <DashboardLayout
      title="Feedback and Certificates"
      subtitle="Collect post-event feedback and review issued certificates in one workspace."
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeader eyebrow="Feedback" title="Participant feedback" description="Send ratings and comments after attending an event." />
        <div className="mt-4">
          <CrudPage {...{ ...feedbackPage, title: 'Feedback', allowDelete: false }} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeader eyebrow="Certificates" title="Issued certificates" description="Keep certificate URLs on file for quick sharing and verification." />
        <div className="mt-4">
          <CrudPage {...{ ...certificatePage, title: 'Certificates', allowDelete: false }} />
        </div>
      </section>
    </DashboardLayout>
  );
}
