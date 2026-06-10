import ConvenerLayout from '../../components/ConvenerLayout';
import CrudPage from '../../components/CrudPage';
import { registrationPage } from '../../lib/pageConfigs';

export default function RegistrationDetails() {
  return (
    <ConvenerLayout title="Registration Details" subtitle="Review every registration written by the live desk and participant self-service flow.">
      <CrudPage
        {...{
          ...registrationPage,
          title: 'Registration Details',
          description: 'Review every registration written by the live desk and participant self-service flow.',
          allowCreate: false,
          allowEdit: false,
          allowDelete: false,
        }}
      />
    </ConvenerLayout>
  );
}
