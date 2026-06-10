import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import ConvenerLayout from '../../components/ConvenerLayout';
import { SectionHeader } from '../../components/Primitives';
import api from '../../services/api';

export default function RegistrationFormTemplate() {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState('');
  const [qr, setQr] = useState('');

  useEffect(() => {
    api.get('/events/').then(({ data }) => setEvents(data?.results || data || [])).catch(console.error);
  }, []);

  const selectedEvent = useMemo(() => events.find((event) => String(event.id) === String(eventId)), [events, eventId]);

  useEffect(() => {
    const loadQr = async () => {
      if (!selectedEvent) {
        setQr('');
        return;
      }
      const url = `${window.location.origin}/participant/register?event=${selectedEvent.id}`;
      setQr(await QRCode.toDataURL(url, { margin: 1, scale: 6 }));
    };
    loadQr().catch(console.error);
  }, [selectedEvent]);

  return (
    <ConvenerLayout
      title="Registration Form Template"
      subtitle="Share a clean registration QR and keep the event intake shape consistent."
    >
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeader eyebrow="Template" title="Event registration preview" description="Pick an event to generate a shareable QR link and preview the registration intake." />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Select event</span>
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">Choose an event</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>{event.title}</option>
                ))}
              </select>
            </label>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Form fields</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>Name</li>
                <li>Email</li>
                <li>Department</li>
                <li>Phone</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-medium text-slate-900">Registration URL</p>
            <p className="mt-1 break-all text-slate-600">
              {selectedEvent ? `${window.location.origin}/participant/register?event=${selectedEvent.id}` : 'Pick an event to generate the link'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeader eyebrow="QR" title="Share code" description="Use the QR code for live registration desks and event posters." />
          <div className="mt-5 flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-5">
            {qr ? <img src={qr} alt="Registration QR code" className="h-56 w-56" /> : <p className="text-sm text-slate-500">Pick an event to generate QR code</p>}
          </div>
          {selectedEvent ? <p className="mt-4 text-center text-sm font-medium text-slate-900">{selectedEvent.title}</p> : null}
        </div>
      </section>
    </ConvenerLayout>
  );
}
