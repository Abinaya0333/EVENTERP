import CrudPage from '../../components/CrudPage';
import { eventPage } from '../../lib/pageConfigs';

export default function MyEvents() {
  return <CrudPage {...eventPage} />;
}
