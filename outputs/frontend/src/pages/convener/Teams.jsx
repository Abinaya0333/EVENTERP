import ConvenerLayout from '../../components/ConvenerLayout';
import CrudPage from '../../components/CrudPage';
import { committeePage } from '../../lib/pageConfigs';

export default function Teams() {
  return (
    <ConvenerLayout title="Teams" subtitle="Keep team groupings aligned with each event and maintain the working structure for the convener desk.">
      <CrudPage
        {...{
          ...committeePage,
          title: 'Teams',
          description: 'Keep team groupings aligned with each event and maintain the working structure for the convener desk.',
        }}
      />
    </ConvenerLayout>
  );
}
