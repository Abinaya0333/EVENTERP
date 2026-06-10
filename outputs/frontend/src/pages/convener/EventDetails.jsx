import ConvenerLayout from '../../components/ConvenerLayout';
import CrudPage from '../../components/CrudPage';
import { eventPage } from '../../lib/pageConfigs';

export default function EventDetails() {
  return (
    <ConvenerLayout title="Event Details" subtitle="Review the event records and keep the core event details synchronized with the approval workflow.">
      <CrudPage
        {...{
          ...eventPage,
          title: 'Event Details',
          description: 'Review the event records and keep the core event details synchronized with the approval workflow.',
        }}
      />
    </ConvenerLayout>
  );
}
