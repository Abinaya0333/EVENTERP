import { XCircle } from 'lucide-react';
import CrudPage from '../../components/CrudPage';
import { createApiAction, myRegistrationsPage } from '../../lib/pageConfigs';

const config = {
  ...myRegistrationsPage,
  rowActions: [
    createApiAction({
      label: 'Cancel',
      variant: 'danger',
      icon: XCircle,
      handler: async (item, { api, toastSuccess }) => {
        await api.patch(`/registrations/${item.id}/`, { status: 'CANCELLED' });
        toastSuccess?.('Registration cancelled');
      },
    }),
  ],
};

export default function MyRegistrations() {
  return <CrudPage {...config} />;
}
