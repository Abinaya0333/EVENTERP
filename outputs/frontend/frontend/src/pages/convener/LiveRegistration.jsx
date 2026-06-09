import CrudPage from '../../components/CrudPage';
import { registrationPage } from '../../lib/pageConfigs';

export default function LiveRegistration() {
  return <CrudPage {...registrationPage} />;
}
