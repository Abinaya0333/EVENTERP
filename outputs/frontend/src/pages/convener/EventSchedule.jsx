import ConvenerLayout from '../../components/ConvenerLayout';
import CrudPage from '../../components/CrudPage';
import { eventPage } from '../../lib/pageConfigs';

export default function EventSchedule() {
  return (
    <ConvenerLayout title="Event Schedule" subtitle="Manage scheduled events and keep the convener calendar current.">
      <CrudPage
        {...{
          ...eventPage,
          title: 'Event Schedule',
          description: 'Manage scheduled events and keep the convener calendar current.',
        }}
      />
    </ConvenerLayout>
  );
}
