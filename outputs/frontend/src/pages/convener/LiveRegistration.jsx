import { useEffect, useMemo, useState } from 'react';
import { Search, UserRoundPlus } from 'lucide-react';
import ConvenerLayout from '../../components/ConvenerLayout';
import { EmptyState, MiniButton, SectionHeader, StatusPill } from '../../components/Primitives';
import { formatDateTime } from '../../components/Shared';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

function unwrap(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export default function LiveRegistration() {
  const { success, error: toastError } = useToast();
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState([]);

  const selectedEvent = useMemo(
    () => events.find((event) => String(event.id) === String(selectedEventId)),
    [events, selectedEventId],
  );

  const loadEvents = async () => {
    const { data } = await api.get('/events/', { params: { status: 'APPROVED' } });
    const rows = unwrap(data);
    setEvents(rows);
    if (!selectedEventId && rows.length) {
      setSelectedEventId(String(rows[0].id));
    }
  };

  const loadRegistrations = async (eventId) => {
    if (!eventId) {
      setRegistrations([]);
      return;
    }
    const { data } = await api.get('/registrations/', { params: { event: eventId } });
    setRegistrations(unwrap(data));
  };

  useEffect(() => {
    let alive = true;
    const init = async () => {
      setLoading(true);
      try {
        await loadEvents();
      } catch (error) {
        console.error(error);
        toastError('Failed to load approved events');
      } finally {
        if (alive) setLoading(false);
      }
    };
    init();
    return () => {
      alive = false;
    };
  }, [toastError]);

  useEffect(() => {
    loadRegistrations(selectedEventId).catch((error) => {
      console.error(error);
      toastError('Failed to load registrations');
    });
  }, [selectedEventId, toastError]);

  const searchParticipant = async () => {
    if (!query.trim()) {
      setMatches([]);
      return;
    }
    setSearching(true);
    try {
      const { data } = await api.get('/users/search/', { params: { q: query.trim() } });
      const rows = unwrap(data);
      setMatches(rows);
      if (!rows.length) {
        toastError('No participant found for that email or name');
      }
    } catch (error) {
      console.error(error);
      toastError('Unable to search participants');
    } finally {
      setSearching(false);
    }
  };

  const registerParticipant = async (user) => {
    if (!selectedEventId) {
      toastError('Select an approved event first');
      return;
    }
    try {
      await api.post('/registrations/', {
        event: Number(selectedEventId),
        user: user.id,
      });
      success(`${user.name || user.email} registered`);
      await loadRegistrations(selectedEventId);
    } catch (error) {
      console.error(error);
      toastError(error.response?.data?.detail || 'Unable to register participant');
    }
  };

  return (
    <ConvenerLayout
      title="Live Registration"
      subtitle="Look up a participant by email, then write the registration directly to the database for the selected approved event."
    >
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeader
              eyebrow="Desk"
              title="Find participant"
              description="Search by email or name, select the event, and register them in one action."
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

              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Participant email or name</span>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    placeholder="participant@cit.edu"
                  />
                </label>
                <div className="flex items-end">
                  <MiniButton
                    type="button"
                    icon={Search}
                    label={searching ? 'Searching' : 'Find'}
                    variant="primary"
                    onClick={searchParticipant}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeader
              eyebrow="Matches"
              title="Search results"
              description="Register the matched participant directly from this desk."
            />
            <div className="mt-4 space-y-3">
              {matches.length ? (
                matches.map((user) => (
                  <div key={user.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{user.name || user.email}</p>
                        <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                        <p className="mt-1 text-xs text-slate-500">{user.department || 'No department set'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusPill value={user.role || 'PARTICIPANT'} />
                        <MiniButton
                          icon={UserRoundPlus}
                          label="Register"
                          variant="primary"
                          onClick={() => registerParticipant(user)}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  title="No participant selected"
                  description="Search for a participant before creating the registration."
                  icon={Search}
                />
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeader
            eyebrow="Live list"
            title="Registrations for this event"
            description="The records below are written by the backend and refresh after each registration."
          />
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Participant</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Registered</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="3" className="px-4 py-8 text-center text-slate-500">Loading approved events...</td>
                  </tr>
                ) : registrations.length ? (
                  registrations.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{item.user_name || item.user?.name || 'Participant'}</div>
                        <div className="mt-1 text-xs text-slate-500">{item.user?.email || 'No email'}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDateTime(item.registered_at)}</td>
                      <td className="px-4 py-3"><StatusPill value={item.status} /></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-4 py-8">
                      <EmptyState
                        title="No registrations yet"
                        description="Search and register a participant to populate this table."
                        icon={UserRoundPlus}
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {selectedEvent ? (
            <p className="mt-4 text-sm text-slate-600">
              Selected event: <span className="font-medium text-slate-900">{selectedEvent.title}</span>
            </p>
          ) : null}
        </div>
      </section>
    </ConvenerLayout>
  );
}
