import CrudPage from '../../components/CrudPage';
import { budgetPage } from '../../lib/pageConfigs';

export default function BudgetLedger() {
  return <CrudPage {...budgetPage} />;
}
