import { useEffect, useMemo, useState } from 'react';
import { PencilLine, Plus, RefreshCcw, Save, Search, Trash2, X } from 'lucide-react';
import api from '../services/api';
import { formatDateTime } from './Shared';
import LoadingSpinner from './LoadingSpinner';
import { EmptyState, MiniButton, SectionHeader, StatusPill, ToolbarInput } from './Primitives';
import { useToast } from '../contexts/ToastContext';

function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  return [];
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function toDateTimeInput(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getPath(path) {
  return path.split('?')[0].replace(/\/?$/, '/');
}

function getValue(item, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), item);
}

function normalizeInitialValues(fields, initialValues = {}) {
  const values = {};
  fields.forEach((field) => {
    const raw = initialValues[field.name];
    if (field.type === 'checkbox') {
      values[field.name] = Boolean(raw);
    } else if (field.type === 'datetime-local') {
      values[field.name] = toDateTimeInput(raw);
    } else if (raw != null) {
      values[field.name] = raw;
    } else if (field.defaultValue != null) {
      values[field.name] = field.defaultValue;
    } else {
      values[field.name] = field.type === 'checkbox' ? false : '';
    }
  });
  return values;
}

function fieldToPayloadValue(field, value) {
  if (field.transformOnSave) {
    return field.transformOnSave(value);
  }
  if (field.type === 'checkbox') {
    return Boolean(value);
  }
  if (field.type === 'number') {
    if (value === '' || value == null) return null;
    return Number(value);
  }
  if (field.type === 'datetime-local') {
    if (!value) return null;
    return new Date(value).toISOString();
  }
  return value;
}

function pickLookupOptionLabel(field, item) {
  if (typeof field.optionLabel === 'function') {
    return field.optionLabel(item);
  }
  if (field.optionLabelKey) {
    return getValue(item, field.optionLabelKey);
  }
  return item.name || item.title || item.email || item.code || `#${item.id}`;
}

export default function CrudPage({
  title,
  description,
  listPath,
  itemPath,
  fields = [],
  columns = [],
  initialValues = {},
  lookups = [],
  allowCreate = true,
  allowEdit = true,
  allowDelete = true,
  createLabel = 'Create',
  emptyTitle = 'Nothing here yet',
  emptyDescription = 'Add the first record to get started.',
  searchPlaceholder = 'Search records',
  formHint,
  rowActions = [],
  queryParams,
}) {
  const { success, error: toastError } = useToast();
  const basePath = useMemo(() => getPath(itemPath || listPath), [itemPath, listPath]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(() => normalizeInitialValues(fields, initialValues));
  const [lookupData, setLookupData] = useState({});
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    setForm(normalizeInitialValues(fields, initialValues));
  }, [fields, initialValues]);

  useEffect(() => {
    let alive = true;

    const fetchLookups = async () => {
      if (!lookups.length) return;
      const entries = await Promise.all(
        lookups.map(async (lookup) => {
          const { data } = await api.get(lookup.endpoint);
          return [lookup.key, unwrapList(data)];
        }),
      );
      if (alive) {
        setLookupData(Object.fromEntries(entries));
      }
    };

    fetchLookups().catch((err) => {
      console.error(err);
      toastError('Failed to load lookup data');
    });

    return () => {
      alive = false;
    };
  }, [lookups, refreshIndex, toastError]);

  useEffect(() => {
    let alive = true;

    const fetchItems = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(listPath, { params: queryParams });
        if (alive) {
          setItems(unwrapList(data));
        }
      } catch (err) {
        console.error(err);
        toastError('Failed to load records');
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchItems();
    return () => {
      alive = false;
    };
  }, [listPath, queryParams, refreshIndex, toastError]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => JSON.stringify(item).toLowerCase().includes(q));
  }, [items, search]);

  const resetForm = () => {
    setEditingId(null);
    setForm(normalizeInitialValues(fields, initialValues));
  };

  const startEdit = (item) => {
    const next = {};
    fields.forEach((field) => {
      const raw = field.getValue ? field.getValue(item) : getValue(item, field.source || field.name);
      if (field.type === 'checkbox') {
        next[field.name] = Boolean(raw);
      } else if (field.type === 'datetime-local') {
        next[field.name] = toDateTimeInput(raw);
      } else if (raw != null) {
        next[field.name] = raw;
      } else {
        next[field.name] = '';
      }
    });
    setEditingId(item.id);
    setForm(next);
  };

  const saveItem = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {};
      fields.forEach((field) => {
        if (field.readOnly) return;
        const value = form[field.name];
        if (field.skipIfEmpty && (value === '' || value == null || value === false)) return;
        const normalized = fieldToPayloadValue(field, value);
        if (normalized !== undefined) {
          payload[field.name] = normalized;
        }
      });

      if (editingId) {
        await api.patch(`${basePath}${editingId}/`, payload);
        success('Record updated');
      } else {
        await api.post(basePath, payload);
        success('Record created');
      }
      resetForm();
      setRefreshIndex((n) => n + 1);
    } catch (err) {
      console.error(err);
      toastError(err.response?.data?.detail || 'Unable to save record');
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (item) => {
    if (!window.confirm(`Delete ${item.name || item.title || `#${item.id}`}?`)) return;
    try {
      await api.delete(`${basePath}${item.id}/`);
      success('Record deleted');
      setRefreshIndex((n) => n + 1);
    } catch (err) {
      console.error(err);
      toastError('Unable to delete record');
    }
  };

  const runAction = async (action, item) => {
    try {
      await action(item, {
        refresh: () => setRefreshIndex((n) => n + 1),
        setSaving,
        toastSuccess: success,
        toastError,
        api,
      });
      setRefreshIndex((n) => n + 1);
    } catch (err) {
      console.error(err);
      toastError(err.response?.data?.detail || 'Action failed');
    }
  };

  return (
    <section className="space-y-5">
      <SectionHeader
        title={title}
        description={description}
        actions={[
          allowCreate ? (
            <MiniButton key="new" icon={Plus} label={editingId ? 'New item' : createLabel} variant="primary" onClick={resetForm} />
          ) : null,
          <MiniButton key="refresh" icon={RefreshCcw} label="Refresh" onClick={() => setRefreshIndex((n) => n + 1)} />,
        ].filter(Boolean)}
      />

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        {fields.length && allowCreate ? (
          <form onSubmit={saveItem} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{editingId ? 'Edit record' : 'Create record'}</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">{editingId ? 'Update details' : 'New entry'}</h2>
              </div>
              {editingId ? <StatusPill value="Editing" /> : null}
            </div>

            <div className="space-y-4">
              {fields.map((field) => {
                const options = field.options || (field.lookup ? lookupData[field.lookup] || [] : []);
                const fieldId = `${title}-${field.name}`;
                const label = field.label || field.name;
                const commonClass = 'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200';

                return (
                  <label key={field.name} className="block">
                    <span className="text-sm font-medium text-slate-700">{label}</span>
                    {field.type === 'textarea' ? (
                      <textarea
                        id={fieldId}
                        rows={field.rows || 4}
                        value={form[field.name] ?? ''}
                        onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
                        placeholder={field.placeholder}
                        className={commonClass}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        id={fieldId}
                        value={form[field.name] ?? ''}
                        onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
                        className={commonClass}
                      >
                        <option value="">Select {label}</option>
                        {options.map((option) => (
                          <option key={option.value ?? option.id} value={option.value ?? option.id}>
                            {option.label ?? pickLookupOptionLabel(field, option)}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'checkbox' ? (
                      <label className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={Boolean(form[field.name])}
                          onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.checked }))}
                          className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                        />
                        <span>{field.checkboxLabel || label}</span>
                      </label>
                    ) : (
                      <input
                        id={fieldId}
                        type={field.type || 'text'}
                        value={form[field.name] ?? ''}
                        onChange={(e) => setForm((prev) => ({ ...prev, [field.name]: e.target.value }))}
                        placeholder={field.placeholder}
                        className={commonClass}
                      />
                    )}
                  </label>
                );
              })}
            </div>

            {formHint ? <p className="mt-4 text-xs leading-5 text-slate-500">{formHint}</p> : null}

            <div className="mt-5 flex flex-wrap gap-2">
              <MiniButton type="submit" icon={Save} label={saving ? 'Saving' : editingId ? 'Update' : 'Save'} variant="primary" />
              <MiniButton type="button" icon={X} label="Clear" onClick={resetForm} />
            </div>
          </form>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Records</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">{columns.length} columns</h2>
            </div>
            <div className="w-full md:max-w-sm">
              <ToolbarInput
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : filteredItems.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {columns.map((column) => (
                      <th key={column.key || column.label} className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {column.label}
                      </th>
                    ))}
                    <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="align-top">
                      {columns.map((column) => {
                        const raw = column.render ? column.render(item, { lookups: lookupData }) : getValue(item, column.key);
                        const value =
                          raw == null || raw === ''
                            ? '-'
                            : column.type === 'datetime' || (typeof raw === 'string' && raw.includes('T'))
                              ? formatDateTime(raw)
                              : raw;
                        return (
                          <td key={column.key || column.label} className="px-3 py-4 text-slate-700">
                            {column.type === 'status' ? <StatusPill value={value} /> : value}
                          </td>
                        );
                      })}
                      <td className="px-3 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {rowActions.map((action) => (
                            <MiniButton
                              key={action.label}
                              icon={action.icon}
                              label={action.label}
                              variant={action.variant}
                              onClick={() => runAction(action.onClick, item)}
                            />
                          ))}
                          {allowEdit ? (
                            <MiniButton icon={PencilLine} label="Edit" onClick={() => startEdit(item)} />
                          ) : null}
                          {allowDelete ? (
                            <MiniButton icon={Trash2} label="Delete" variant="danger" onClick={() => deleteItem(item)} />
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title={emptyTitle}
              description={emptyDescription}
              action={allowCreate ? <MiniButton icon={Plus} label={createLabel} variant="primary" onClick={resetForm} /> : null}
            />
          )}
        </div>
      </div>
    </section>
  );
}
