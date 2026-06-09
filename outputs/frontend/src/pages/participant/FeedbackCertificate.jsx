import { useEffect, useMemo, useState } from 'react';
import { Award, Download } from 'lucide-react';
import ParticipantLayout from '../../components/ParticipantLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

export default function FeedbackCertificate() {
  const { success, error: toastError } = useToast();
  const [registrations, setRegistrations] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [forms, setForms] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [registrationRes, feedbackRes, certificateRes] = await Promise.all([
        api.get('/registrations/'),
        api.get('/feedback/'),
        api.get('/certificates/'),
      ]);
      setRegistrations(unwrapList(registrationRes.data));
      setFeedback(unwrapList(feedbackRes.data));
      setCertificates(unwrapList(certificateRes.data));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => toastError('Unable to load feedback and certificates'));
  }, []);

  const feedbackByEvent = useMemo(() => new Map(feedback.map((item) => [item.event, item])), [feedback]);
  const certificateByEvent = useMemo(() => new Map(certificates.map((item) => [item.event, item])), [certificates]);
  const closedRegistrations = useMemo(
    () => registrations.filter((item) => item.status === 'REGISTERED' && item.event_status === 'COMPLETED'),
    [registrations],
  );

  const setFormValue = (eventId, key, value) => {
    setForms((current) => ({
      ...current,
      [eventId]: {
        rating: '5',
        comment: '',
        ...current[eventId],
        [key]: value,
      },
    }));
  };

  const submitFeedback = async (eventId) => {
    const form = { rating: '5', comment: '', ...forms[eventId] };
    setSavingId(eventId);
    try {
      await api.post('/feedback/', {
        event: eventId,
        rating: Number(form.rating),
        comment: form.comment,
      });
      success('Feedback submitted');
      await load();
    } catch {
      toastError('Unable to submit feedback');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <ParticipantLayout title="Feedback & Certificates">
      <h2 className="text-[32px] font-bold text-slate-950">Feedback & Certificates</h2>
      <p className="mt-8 text-lg text-slate-700">Events you attended that are now closed. Submit feedback to unlock your certificate.</p>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : closedRegistrations.length || certificates.length ? (
          <div className="divide-y divide-slate-100">
            {closedRegistrations.map((registration) => {
              const existingFeedback = feedbackByEvent.get(registration.event);
              const certificate = certificateByEvent.get(registration.event);
              const form = { rating: '5', comment: '', ...forms[registration.event] };
              return (
                <article key={registration.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-950">{registration.event_title || 'Event'}</h3>
                      <p className="mt-1 text-sm text-slate-500">{registration.event_location || 'Closed event'}</p>
                    </div>
                    {certificate ? (
                      <a
                        href={certificate.certificate_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-[#073f73] px-4 py-2 text-sm font-bold text-white hover:bg-[#052f57]"
                      >
                        <Download className="h-4 w-4" />
                        Certificate
                      </a>
                    ) : null}
                  </div>

                  {existingFeedback ? (
                    <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                      Feedback submitted. Rating: {existingFeedback.rating}/5
                    </div>
                  ) : (
                    <div className="mt-5 grid gap-3">
                      <label className="text-sm font-bold text-slate-700">
                        Rating
                        <select
                          value={form.rating}
                          onChange={(event) => setFormValue(registration.event, 'rating', event.target.value)}
                          className="mt-2 h-11 w-full max-w-[180px] rounded-lg border border-slate-200 px-3 text-black outline-none focus:border-[#073f73]"
                        >
                          {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value}</option>)}
                        </select>
                      </label>
                      <label className="text-sm font-bold text-slate-700">
                        Comment
                        <textarea
                          value={form.comment}
                          onChange={(event) => setFormValue(registration.event, 'comment', event.target.value)}
                          rows={3}
                          className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-black outline-none focus:border-[#073f73]"
                          placeholder="Share your experience"
                        />
                      </label>
                      <button
                        type="button"
                        disabled={savingId === registration.event}
                        onClick={() => submitFeedback(registration.event)}
                        className="w-fit rounded-lg bg-[#073f73] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#052f57] disabled:bg-slate-300"
                      >
                        {savingId === registration.event ? 'Submitting...' : 'Submit Feedback'}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}

            {certificates
              .filter((certificate) => !closedRegistrations.some((registration) => registration.event === certificate.event))
              .map((certificate) => (
                <article key={certificate.id} className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <h3 className="text-xl font-bold text-slate-950">{certificate.event_title || 'Certificate'}</h3>
                    <p className="mt-1 text-sm text-slate-500">Certificate available</p>
                  </div>
                  <a
                    href={certificate.certificate_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#073f73] px-4 py-2 text-sm font-bold text-white hover:bg-[#052f57]"
                  >
                    <Download className="h-4 w-4" />
                    Certificate
                  </a>
                </article>
              ))}
          </div>
        ) : (
          <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <Award className="h-16 w-16 text-slate-200" />
            <p className="mt-6 text-xl font-medium text-slate-600">No certificates available yet</p>
            <p className="mt-3 text-lg text-slate-400">You need to attend a closed event to earn a certificate</p>
          </div>
        )}
      </div>
    </ParticipantLayout>
  );
}
