import CrudPage from '../../components/CrudPage';
import { attendancePage } from '../../lib/pageConfigs';

export default function Attendance() {
  return <CrudPage {...attendancePage} />;
}
