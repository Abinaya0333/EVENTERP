import CrudPage from '../../components/CrudPage';
import { budgetHistoryPage } from '../../lib/pageConfigs';

export default function ApprovalHistory() {
  return <CrudPage {...budgetHistoryPage} />;
}
