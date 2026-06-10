import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin } from 'lucide-react';
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

function StatusBadge({ status }) {
  const active = status === 'REGISTERED';
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
      {status || 'REGISTERED'}
    </span>
  );
}

export default function MyRegistrations() {
  const { success, error: toastError } = useToast();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/registrations/');
      setRegistrations(unwrapList(data));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => toastError('Unable to load registrations'));
  }, []);

  const cancelRegistration = async (id) => {
    setSavingId(id);
    try {
      await api.patch(`/registrations/${id}/`, { status: 'CANCELLED' });
      success('Registration cancelled');
      await load();
    } catch {
      toastError('Unable to cancel registration');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <ParticipantLayout title="My Registrations">
      <h2 className="text-[32px] font-bold text-slate-950">My Registrations</h2>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[270px] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : registrations.length ? (
          <div className="divide-y divide-slate-100">
            {registrations.map((registration) => (
              <article key={registration.id} className="flex items-center justify-between gap-6 p-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-950">{registration.event_title || 'Event'}</h3>
                    <StatusBadge status={registration.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                    <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Registered {formatDate(registration.registered_at)}</span>
                    {registration.event_location ? <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {registration.event_location}</span> : null}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={registration.status === 'CANCELLED' || savingId === registration.id}
                  onClick={() => cancelRegistration(registration.id)}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
                >
                  {savingId === registration.id ? 'Cancelling...' : 'Cancel'}
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[270px] flex-col items-center justify-center text-center">
            <CalendarDays className="h-16 w-16 text-slate-200" />
            <p className="mt-6 text-xl font-medium text-slate-600">No registrations yet</p>
            <Link to="/participant" className="mt-3 text-lg text-slate-400 hover:text-[#073f73]">
              Browse events to register
            </Link>
          </div>
        )}
      </div>
    </ParticipantLayout>
  );
}
