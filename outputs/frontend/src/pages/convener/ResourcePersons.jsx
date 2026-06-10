import ConvenerLayout from '../../components/ConvenerLayout';
import CrudPage from '../../components/CrudPage';
import { userManagementPage } from '../../lib/pageConfigs';

export default function ResourcePersons() {
  return (
    <ConvenerLayout title="Resource Persons" subtitle="Maintain the people linked to event sessions, coordination, and support roles.">
      <CrudPage
        {...{
          ...userManagementPage,
          title: 'Resource Persons',
          description: 'Maintain the people linked to event sessions, coordination, and support roles.',
        }}
      />
    </ConvenerLayout>
  );
}
