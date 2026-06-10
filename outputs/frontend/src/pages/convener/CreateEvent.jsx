import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, CalendarPlus2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ConvenerLayout from '../../components/ConvenerLayout';
import { MiniButton, SectionHeader } from '../../components/Primitives';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

function unwrap(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function toIso(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

export default function CreateEvent() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [mode, setMode] = useState('DRAFT');
  const [form, setForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    location: '',
    department: '',
    budget_total: '',
  });

  useEffect(() => {
    api
      .get('/departments/')
      .then(({ data }) => setDepartments(unwrap(data)))
      .catch((err) => {
        console.error(err);
        toastError('Failed to load departments');
      });
  }, [toastError]);

  const selectedDepartment = useMemo(
    () => departments.find((department) => String(department.id) === String(form.department)),
    [departments, form.department],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.start_date || !form.end_date || !form.location.trim() || !form.department) {
      toastError('Please fill the required event fields');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        start_date: toIso(form.start_date),
        end_date: toIso(form.end_date),
        location: form.location.trim(),
        department: Number(form.department),
        status: mode,
      };

      const { data: createdEvent } = await api.post('/events/', payload);

      if (form.budget_total) {
        await api.post('/budgets/', {
          event: createdEvent.id,
          total_amount: Number(form.budget_total),
          approved_amount: 0,
          status: 'DRAFT',
        });
      }

      success(mode === 'PENDING' ? 'Event submitted for approval' : 'Event saved as draft');
      navigate('/convener');
    } catch (error) {
      console.error(error);
      toastError(error.response?.data?.detail || 'Unable to create event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ConvenerLayout
      title="Create Event"
      subtitle="Create a real event record, attach its department, and optionally seed the budget ledger in the same step."
    >
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionHeader
            eyebrow="Event setup"
            title="New event"
            description="Fill the event details and choose whether to save it as a draft or send it into the approval workflow."
          />

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Event title</span>
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="Tech Symposium 2026"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-medium text-slate-700">Description</span>
              <textarea
                rows="5"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="Describe the event, objectives, and highlights"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Department</span>
              <select
                value={form.department}
                onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                <option value="">Select department</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Venue</span>
              <input
                value={form.location}
                onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="Main Auditorium"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Start date and time</span>
              <input
                type="datetime-local"
                value={form.start_date}
                onChange={(e) => setForm((prev) => ({ ...prev, start_date: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">End date and time</span>
              <input
                type="datetime-local"
                value={form.end_date}
                onChange={(e) => setForm((prev) => ({ ...prev, end_date: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Budget estimate (optional)</span>
              <input
                type="number"
                min="0"
                step="1"
                value={form.budget_total}
                onChange={(e) => setForm((prev) => ({ ...prev, budget_total: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="250000"
              />
            </label>

            <div className="block">
              <span className="text-sm font-medium text-slate-700">Workflow</span>
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode('DRAFT')}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium ${mode === 'DRAFT' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700'}`}
                >
                  Save draft
                </button>
                <button
                  type="button"
                  onClick={() => setMode('PENDING')}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium ${mode === 'PENDING' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700'}`}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <MiniButton
              type="submit"
              icon={saving ? Save : CalendarPlus2}
              label={saving ? 'Saving' : mode === 'PENDING' ? 'Submit for approval' : 'Save event'}
              variant="primary"
            />
            <MiniButton
              type="button"
              icon={CheckCircle2}
              label="Cancel"
              onClick={() => navigate('/convener')}
            />
          </div>
        </form>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeader eyebrow="Preview" title="Current selection" description="A quick summary of what will be written to the database." />
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <p><span className="font-medium text-slate-900">Department:</span> {selectedDepartment?.name || 'Not selected'}</p>
              <p><span className="font-medium text-slate-900">Venue:</span> {form.location || 'Not set'}</p>
              <p><span className="font-medium text-slate-900">Start:</span> {form.start_date || 'Not set'}</p>
              <p><span className="font-medium text-slate-900">End:</span> {form.end_date || 'Not set'}</p>
              <p><span className="font-medium text-slate-900">Mode:</span> {mode === 'PENDING' ? 'Submit for approval' : 'Draft'}</p>
              <p><span className="font-medium text-slate-900">Budget:</span> {form.budget_total || '0'}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeader
              eyebrow="Tip"
              title="What happens next"
              description="Approved events can be used by participants, live registration, and the committee workflow."
            />
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              If you save the event as a draft, you can return to the event schedule and edit it later. If you submit it, the event is written with a pending status so it appears in the approval flow.
            </div>
          </div>
        </aside>
      </section>
    </ConvenerLayout>
  );
}
