import CrudPage from '../../components/CrudPage';
import { eventReportPage } from '../../lib/pageConfigs';

export default function CloseEventReports() {
  return <CrudPage {...eventReportPage} />;
}
