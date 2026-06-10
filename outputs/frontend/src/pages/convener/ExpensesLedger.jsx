import ConvenerLayout from '../../components/ConvenerLayout';
import CrudPage from '../../components/CrudPage';
import { budgetPage } from '../../lib/pageConfigs';

export default function ExpensesLedger() {
  return (
    <ConvenerLayout title="Expenses Ledger" subtitle="Track approved budget, actual spend, and itemized expenses for the convener portfolio.">
      <CrudPage
        {...{
          ...budgetPage,
          title: 'Expenses Ledger',
          description: 'Track approved budget, actual spend, and itemized expenses for the convener portfolio.',
        }}
      />
    </ConvenerLayout>
  );
}
