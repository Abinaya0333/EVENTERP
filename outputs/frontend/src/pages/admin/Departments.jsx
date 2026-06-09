import CrudPage from '../../components/CrudPage';
import { departmentPage } from '../../lib/pageConfigs';

export default function Departments() {
  return <CrudPage {...departmentPage} />;
}
