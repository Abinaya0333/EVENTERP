import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { MiniButton, SectionHeader } from '../../components/Primitives';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

function unwrap(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export default function RegisterEvent() {
  const { success, error: toastError } = useToast();
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(searchParams.get('event') || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get('/events/', { params: { status: 'APPROVED' } })
      .then(({ data }) => setEvents(unwrap(data)))
      .catch((error) => {
        console.error(error);
        toastError('Failed to load approved events');
      });
  }, [toastError]);

  const selectedEvent = useMemo(
    () => events.find((event) => String(event.id) === String(selectedEventId)),
    [events, selectedEventId],
  );

  const handleRegister = async () => {
    if (!selectedEventId) {
      toastError('Select an approved event');
      return;
    }

    setSaving(true);
    try {
      await api.post('/registrations/', { event: Number(selectedEventId) });
      success('Registration submitted');
    } catch (error) {
      console.error(error);
      toastError(error.response?.data?.detail || 'Unable to register');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      title="Register for Event"
      subtitle="This page is used by the QR code and by participants who want to self-register for an approved event."
    >
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeader
            eyebrow="Registration"
            title="Select approved event"
            description="Choose the event that was shared by the convener and submit your registration."
          />
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Approved event</span>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">Select approved event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </label>
            <MiniButton
              type="button"
              label={saving ? 'Submitting' : 'Register'}
              variant="primary"
              onClick={handleRegister}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeader eyebrow="Preview" title="Selected event" description="A quick summary before you submit the registration." />
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <p><span className="font-medium text-slate-900">Title:</span> {selectedEvent?.title || 'None selected'}</p>
            <p><span className="font-medium text-slate-900">Venue:</span> {selectedEvent?.location || '-'}</p>
            <p><span className="font-medium text-slate-900">Start:</span> {selectedEvent?.start_date || '-'}</p>
            <p><span className="font-medium text-slate-900">Department:</span> {selectedEvent?.department_name || selectedEvent?.department || '-'}</p>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
