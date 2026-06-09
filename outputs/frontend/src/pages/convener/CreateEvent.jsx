import CrudPage from '../../components/CrudPage';
import { eventPage } from '../../lib/pageConfigs';

export default function CreateEvent() {
  return <CrudPage {...{ ...eventPage, title: 'Create Event', createLabel: 'Save event', allowDelete: false }} />;
}
