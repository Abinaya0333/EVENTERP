import { CalendarPlus2 } from 'lucide-react';
import CrudPage from '../../components/CrudPage';
import { browseEventsPage, createApiAction } from '../../lib/pageConfigs';

const config = {
  ...browseEventsPage,
  rowActions: [
    createApiAction({
      label: 'Register',
      variant: 'primary',
      icon: CalendarPlus2,
      handler: async (item, { api, toastSuccess }) => {
        await api.post('/registrations/', { event: item.id });
        toastSuccess?.('Registration created');
      },
    }),
  ],
};

export default function BrowseEvents() {
  return <CrudPage {...config} />;
}
