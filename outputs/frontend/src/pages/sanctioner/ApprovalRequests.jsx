import { CheckCircle2, XCircle } from 'lucide-react';
import CrudPage from '../../components/CrudPage';
import { budgetApprovalPage, createApiAction } from '../../lib/pageConfigs';

const config = {
  ...budgetApprovalPage,
  rowActions: [
    createApiAction({
      label: 'Approve',
      variant: 'primary',
      icon: CheckCircle2,
      handler: async (item, { api, toastSuccess }) => {
        await api.patch(`/budgets/${item.id}/`, { status: 'APPROVED' });
        toastSuccess?.('Budget approved');
      },
    }),
    createApiAction({
      label: 'Reject',
      variant: 'danger',
      icon: XCircle,
      handler: async (item, { api, toastSuccess }) => {
        await api.patch(`/budgets/${item.id}/`, { status: 'REJECTED' });
        toastSuccess?.('Budget rejected');
      },
    }),
  ],
};

export default function ApprovalRequests() {
  return <CrudPage {...config} />;
}
