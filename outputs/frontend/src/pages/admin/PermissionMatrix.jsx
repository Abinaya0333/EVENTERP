import { useEffect, useMemo, useState } from 'react';
import { Check, Shield, Save, SlidersHorizontal } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const roles = [
  { key: 'ADMIN', label: 'ADMIN' },
  { key: 'CONVENER', label: 'CONVENER' },
  { key: 'SANCTIONER', label: 'SANCTIONER' },
  { key: 'COMMITTEE_MEMBER', label: 'COMMITTEE MEMBER' },
  { key: 'PARTICIPANT', label: 'PARTICIPANT' },
];

const permissions = [
  'Create Event',
  'Edit Event',
  'Submit for Approval',
  'Approve Event',
  'Reject Event',
  'Close Event',
  'Generate Report',
  'Manage Users',
  'Manage Departments',
  'View Reports',
];

function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function keyFor(permission, role) {
  return `${permission}::${role}`;
}

export default function PermissionMatrix() {
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rules, setRules] = useState([]);
  const [draft, setDraft] = useState({});
  const [lastSaved, setLastSaved] = useState(null);

  const defaultDraft = useMemo(() => {
    const matrix = {};
    permissions.forEach((permission) => {
      roles.forEach(({ key }) => {
        matrix[keyFor(permission, key)] = false;
      });
    });

    permissions.forEach((permission) => {
      if (permission === 'Manage Users' || permission === 'Manage Departments') {
        matrix[keyFor(permission, 'ADMIN')] = true;
      }
      if (permission === 'Create Event' || permission === 'Edit Event' || permission === 'Submit for Approval' || permission === 'Close Event' || permission === 'Generate Report' || permission === 'View Reports') {
        matrix[keyFor(permission, 'CONVENER')] = true;
      }
      if (permission === 'Approve Event' || permission === 'Reject Event' || permission === 'View Reports') {
        matrix[keyFor(permission, 'SANCTIONER')] = true;
      }
      if (permission === 'View Reports') {
        matrix[keyFor(permission, 'COMMITTEE_MEMBER')] = true;
      }
      if (permission === 'View Reports') {
        matrix[keyFor(permission, 'PARTICIPANT')] = false;
      }
    });
    return matrix;
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/permission-rules/');
      const list = unwrapList(data);
      setRules(list);

      const next = { ...defaultDraft };
      list.forEach((rule) => {
        next[keyFor(rule.permission, rule.role)] = Boolean(rule.allowed);
      });
      setDraft(next);
      setLastSaved(null);
    } catch (err) {
      toastError('Unable to load permission rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = (permission, role) => {
    const key = keyFor(permission, role);
    setDraft((current) => ({ ...current, [key]: !current[key] }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const existing = new Map(rules.map((rule) => [keyFor(rule.permission, rule.role), rule]));
      const entries = [];
      permissions.forEach((permission) => {
        roles.forEach(({ key: role }) => {
          entries.push({
            permission,
            role,
            allowed: Boolean(draft[keyFor(permission, role)]),
          });
        });
      });

      for (const entry of entries) {
        const match = existing.get(keyFor(entry.permission, entry.role));
        if (match) {
          await api.patch(`/permission-rules/${match.id}/`, entry);
        } else {
          await api.post('/permission-rules/', entry);
        }
      }

      success('Permission matrix saved');
      setLastSaved(new Date());
      await load();
    } catch (err) {
      toastError('Unable to save permission rules');
    } finally {
      setSaving(false);
    }
  };

  const activeCount = Object.values(draft).filter(Boolean).length;

  return (
    <AdminLayout title="Permission Matrix">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-[32px] font-bold text-slate-950">Permission Matrix</h2>
          <p className="mt-2 max-w-3xl text-base text-slate-600">
            Configure role-based access for the event workflow. Changes are saved to the live backend permission table.
          </p>
        </div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-3 rounded-lg bg-[#073f73] px-6 py-3 text-lg font-bold text-white hover:bg-[#052f57] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Save className="h-5 w-5" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 font-semibold text-[#073f73]">
          <Shield className="h-4 w-4" />
          {activeCount} active grants
        </span>
        {lastSaved ? <span>Last saved at {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> : null}
      </div>

      <section className="mt-8 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-[#073f73] text-white">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-[0.12em]">Permission</th>
                  {roles.map((role) => (
                    <th key={role.key} className="px-6 py-4 text-sm font-bold uppercase tracking-[0.12em] text-center">
                      {role.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissions.map((permission) => (
                  <tr key={permission} className="hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#073f73]">
                          <SlidersHorizontal className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-slate-900">{permission}</p>
                          <p className="text-sm text-slate-500">Live toggle stored in the database</p>
                        </div>
                      </div>
                    </td>
                    {roles.map((role) => {
                      const checked = Boolean(draft[keyFor(permission, role.key)]);
                      return (
                        <td key={`${permission}-${role.key}`} className="px-6 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggle(permission, role.key)}
                            className={`inline-flex h-10 w-16 items-center rounded-full border-2 p-1 transition ${
                              checked ? 'border-[#073f73] bg-[#073f73]' : 'border-slate-300 bg-slate-200'
                            }`}
                            aria-pressed={checked}
                            aria-label={`${checked ? 'Disable' : 'Enable'} ${permission} for ${role.label}`}
                          >
                            <span
                              className={`inline-flex h-7 w-7 transform items-center justify-center rounded-full bg-white text-[#073f73] shadow transition ${
                                checked ? 'translate-x-6' : 'translate-x-0'
                              }`}
                            >
                              {checked ? <Check className="h-4 w-4" /> : null}
                            </span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
