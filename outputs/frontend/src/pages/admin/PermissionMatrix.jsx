import DashboardLayout from '../../components/DashboardLayout';
import { SectionHeader, StatusPill } from '../../components/Primitives';

const rows = [
  { role: 'ADMIN', access: 'Full system control' },
  { role: 'CONVENER', access: 'Event creation, committees, reports, live workflows' },
  { role: 'SANCTIONER', access: 'Budget approvals and financial history' },
  { role: 'COMMITTEE_MEMBER', access: 'Tasks and attendance' },
  { role: 'PARTICIPANT', access: 'Browse events, register, submit feedback' },
];

export default function PermissionMatrix() {
  return (
    <DashboardLayout
      title="Permission Matrix"
      subtitle="A quick reference for how each role maps onto the event management workflow."
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <SectionHeader
          eyebrow="Access"
          title="Role permissions"
          description="The matrix below mirrors the RBAC rules in the Django backend."
        />
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Permissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.role}>
                  <td className="px-4 py-3"><StatusPill value={row.role} /></td>
                  <td className="px-4 py-3 text-slate-700">{row.access}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardLayout>
  );
}
