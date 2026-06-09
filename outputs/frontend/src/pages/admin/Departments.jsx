import { useEffect, useState } from 'react';
import { Edit3, Plus, Trash2, X } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

const emptyForm = { name: '', code: '' };

export default function Departments() {
  const { success, error: toastError } = useToast();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/departments/');
      setDepartments(unwrapList(data));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => toastError('Unable to load departments'));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (department) => {
    setEditing(department);
    setForm({ name: department.name || '', code: department.code || '' });
    setModalOpen(true);
  };

  const save = async (event) => {
    event.preventDefault();
    try {
      if (editing) {
        await api.patch(`/departments/${editing.id}/`, form);
        success('Department updated');
      } else {
        await api.post('/departments/', form);
        success('Department created');
      }
      setModalOpen(false);
      await load();
    } catch {
      toastError('Unable to save department');
    }
  };

  const remove = async (department) => {
    try {
      await api.delete(`/departments/${department.id}/`);
      success('Department deleted');
      await load();
    } catch {
      toastError('Unable to delete department');
    }
  };

  return (
    <AdminLayout title="Department Management">
      <div className="flex items-center justify-between">
        <h2 className="text-[32px] font-bold text-slate-950">Department Management</h2>
        <button onClick={openCreate} className="inline-flex items-center gap-3 rounded-lg bg-[#073f73] px-6 py-3 text-lg font-bold text-white hover:bg-[#052f57]">
          <Plus className="h-5 w-5" /> Add Department
        </button>
      </div>

      <section className="mt-8 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[260px] items-center justify-center"><LoadingSpinner /></div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-lg text-slate-600">
              <tr>
                <th className="px-6 py-4 font-bold">Department Name</th>
                <th className="px-6 py-4 font-bold">Code</th>
                <th className="px-6 py-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departments.map((department) => (
                <tr key={department.id}>
                  <td className="px-6 py-5 text-lg font-semibold text-slate-800">{department.name}</td>
                  <td className="px-6 py-5"><span className="rounded bg-blue-50 px-3 py-1 font-mono text-sm font-bold text-[#073f73]">{department.code}</span></td>
                  <td className="px-6 py-5">
                    <div className="flex gap-4">
                      <button onClick={() => openEdit(department)} className="text-blue-500 hover:text-blue-700" aria-label="Edit department"><Edit3 className="h-5 w-5" /></button>
                      <button onClick={() => remove(department)} className="text-red-500 hover:text-red-700" aria-label="Delete department"><Trash2 className="h-5 w-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <form onSubmit={save} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">{editing ? 'Edit Department' : 'Add Department'}</h3>
              <button type="button" onClick={() => setModalOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <label className="mt-5 block text-sm font-bold text-slate-700">Department Name
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-black outline-none focus:border-[#073f73]" />
            </label>
            <label className="mt-4 block text-sm font-bold text-slate-700">Code
              <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-black outline-none focus:border-[#073f73]" />
            </label>
            <button className="mt-6 w-full rounded-lg bg-[#073f73] py-3 font-bold text-white">Save</button>
          </form>
        </div>
      ) : null}
    </AdminLayout>
  );
}
