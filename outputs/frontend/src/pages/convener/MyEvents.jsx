import ConvenerLayout from '../../components/ConvenerLayout';
import CrudPage from '../../components/CrudPage';
import { createApiAction, eventPage } from '../../lib/pageConfigs';
import { CheckCircle2, PlayCircle, Send } from 'lucide-react';

const scheduleConfig = {
  ...eventPage,
  title: 'Event Schedule',
  description: 'Review your event portfolio, update records, and push events through the workflow.',
  allowCreate: false,
  allowDelete: false,
  rowActions: [
    createApiAction({
      label: 'Submit',
      variant: 'primary',
      icon: Send,
      handler: async (item, { api, toastSuccess }) => {
        await api.patch(`/events/${item.id}/`, { status: 'PENDING' });
        toastSuccess?.('Event submitted for approval');
      },
    }),
    createApiAction({
      label: 'Approve',
      variant: 'default',
      icon: CheckCircle2,
      handler: async (item, { api, toastSuccess }) => {
        await api.post(`/events/${item.id}/approve/`);
        toastSuccess?.('Event approved');
      },
    }),
    createApiAction({
      label: 'Complete',
      variant: 'default',
      icon: PlayCircle,
      handler: async (item, { api, toastSuccess }) => {
        await api.post(`/events/${item.id}/complete/`);
        toastSuccess?.('Event marked completed');
      },
    }),
  ],
};

export default function MyEvents() {
  return (
    <ConvenerLayout title="Event Schedule" subtitle="Review your event portfolio, update records, and push events through the workflow.">
      <CrudPage {...scheduleConfig} />
    </ConvenerLayout>
  );
}
