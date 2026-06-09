import CrudPage from '../../components/CrudPage';
import { userManagementPage } from '../../lib/pageConfigs';

export default function UserManagement() {
  return <CrudPage {...userManagementPage} />;
}
