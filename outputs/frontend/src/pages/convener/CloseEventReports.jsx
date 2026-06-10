import ConvenerLayout from '../../components/ConvenerLayout';
import CrudPage from '../../components/CrudPage';
import { eventReportPage } from '../../lib/pageConfigs';

export default function CloseEventReports() {
  return (
    <ConvenerLayout title="Reports (NAAC)" subtitle="Write the close-out report for each completed event and preserve the record for the archive.">
      <CrudPage
        {...{
          ...eventReportPage,
          title: 'Reports (NAAC)',
          description: 'Write the close-out report for each completed event and preserve the record for the archive.',
        }}
      />
    </ConvenerLayout>
  );
}
