import ConvenerLayout from '../../components/ConvenerLayout';
import CrudPage from '../../components/CrudPage';
import { attendancePage } from '../../lib/pageConfigs';

export default function ConvenerMeetings() {
  return (
    <ConvenerLayout title="Meetings & Attendance" subtitle="Record attendance for event sessions and keep the committee desk aligned with the live operation.">
      <CrudPage
        {...{
          ...attendancePage,
          title: 'Meetings & Attendance',
          description: 'Record attendance for event sessions and keep the committee desk aligned with the live operation.',
        }}
      />
    </ConvenerLayout>
  );
}
