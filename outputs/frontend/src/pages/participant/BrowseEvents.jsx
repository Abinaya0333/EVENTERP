import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, MapPin, Search } from 'lucide-react';
import ParticipantLayout from '../../components/ParticipantLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;
  const first = Object.values(data)[0];
  if (Array.isArray(first)) return first[0];
  return typeof first === 'string' ? first : fallback;
}

export default function BrowseEvents() {
  const { success, error: toastError } = useToast();
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [eventRes, registrationRes] = await Promise.all([
        api.get('/events/', { params: { status: 'APPROVED' } }),
        api.get('/registrations/'),
      ]);
      setEvents(unwrapList(eventRes.data));
      setRegistrations(unwrapList(registrationRes.data));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => toastError('Unable to load events'));
  }, []);

  const registeredEventIds = useMemo(
    () => new Set(registrations.filter((item) => item.status !== 'CANCELLED').map((item) => item.event)),
    [registrations],
  );

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return events;
    return events.filter((event) =>
      [event.title, event.description, event.location, event.department_name]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [events, search]);

  const register = async (eventId) => {
    setRegisteringId(eventId);
    try {
      await api.post('/registrations/', { event: eventId });
      success('Registration created');
      await load();
    } catch (err) {
      toastError(getErrorMessage(err, 'Unable to register for this event'));
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <ParticipantLayout title="Browse Events">
      <h2 className="text-[32px] font-bold text-slate-950">Browse Events</h2>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="relative max-w-[560px]">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-12 pr-4 text-base text-black outline-none transition focus:border-[#073f73] focus:ring-2 focus:ring-[#073f73]/15"
            placeholder="Search approved events..."
          />
        </div>

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : filteredEvents.length ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {filteredEvents.map((event) => {
              const registered = registeredEventIds.has(event.id);
              return (
                <article key={event.id} className="rounded-xl border border-slate-200 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-950">{event.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{event.description || 'No description provided.'}</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Approved</span>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-slate-600">
                    <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {formatDate(event.start_date)} to {formatDate(event.end_date)}</p>
                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {event.location || 'Venue not set'}</p>
                  </div>
                  <button
                    type="button"
                    disabled={registered || registeringId === event.id}
                    onClick={() => register(event.id)}
                    className="mt-5 rounded-lg bg-[#073f73] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#052f57] disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {registered ? 'Registered' : registeringId === event.id ? 'Registering...' : 'Register'}
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
            <CalendarDays className="h-16 w-16 text-slate-200" />
            <p className="mt-6 text-xl font-medium text-slate-600">No approved events available yet</p>
          </div>
        )}
      </div>
    </ParticipantLayout>
  );
}
