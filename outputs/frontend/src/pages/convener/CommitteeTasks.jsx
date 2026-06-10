import ConvenerLayout from '../../components/ConvenerLayout';
import CrudPage from '../../components/CrudPage';
import { committeePage, committeeMemberPage, taskPage } from '../../lib/pageConfigs';
import { SectionHeader } from '../../components/Primitives';

export default function CommitteeTasks() {
  return (
    <ConvenerLayout
      title="Committees and Tasks"
      subtitle="Build committee structures, assign members, and keep task ownership visible."
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeader eyebrow="Committees" title="Committee setup" description="Define the committees attached to the event portfolio." />
        <div className="mt-4">
          <CrudPage {...{ ...committeePage, title: 'Committees', allowDelete: true }} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeader eyebrow="Members" title="Committee members" description="Link users to committees and assign responsibility." />
        <div className="mt-4">
          <CrudPage {...committeeMemberPage} />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeader eyebrow="Tasks" title="Task board" description="Track operational tasks tied to committees and deadlines." />
        <div className="mt-4">
          <CrudPage {...taskPage} />
        </div>
      </section>
    </ConvenerLayout>
  );
}
