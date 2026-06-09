import { CheckCircle2 } from 'lucide-react';
import CrudPage from '../../components/CrudPage';
import { createApiAction, myTasksPage } from '../../lib/pageConfigs';

const config = {
  ...myTasksPage,
  rowActions: [
    createApiAction({
      label: 'Complete',
      variant: 'primary',
      icon: CheckCircle2,
      handler: async (item, { api, toastSuccess }) => {
        await api.patch(`/tasks/${item.id}/`, { status: 'DONE' });
        toastSuccess?.('Task completed');
      },
    }),
  ],
};

export default function MyTasks() {
  return <CrudPage {...config} />;
}
