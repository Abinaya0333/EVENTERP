import { useEffect, useState } from 'react';
import { Edit3, KeyRound, Plus, Power, Trash2, X } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const roles = [
  ['ADMIN', 'Admin'],
  ['CONVENER', 'Convener'],
  ['SANCTIONER', 'Sanctioner'],
  ['COMMITTEE_MEMBER', 'Committee Member'],
  ['PARTICIPANT', 'Participant'],
];

function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function roleClass(role) {
  if (role === 'ADMIN') return 'bg-red-50 text-red-700';
  if (role === 'SANCTIONER') return 'bg-purple-50 text-purple-700';
  if (role === 'CONVENER') return 'bg-blue-50 text-blue-700';
  if (role === 'COMMITTEE_MEMBER') return 'bg-emerald-50 text-emerald-700';
  return 'bg-slate-100 text-slate-700';
}

const emptyForm = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  role: 'PARTICIPANT',
  approval_level: '',
  approval_title: '',
  department_id: '',
  is_staff: false,
  is_active: true,
};

export default function UserManagement() {
  const { success, error: toastError } = useToast();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const [userRes, departmentRes] = await Promise.all([api.get('/users/'), api.get('/departments/')]);
      setUsers(unwrapList(userRes.data));
      setDepartments(unwrapList(departmentRes.data));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => toastError('Unable to load users'));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'PARTICIPANT',
      approval_level: user.approval_level || '',
      approval_title: user.approval_title || '',
      department_id: user.department_id || '',
      is_staff: Boolean(user.is_staff),
      is_active: user.is_active !== false,
    });
    setModalOpen(true);
  };

  const payloadFromForm = () => {
    const payload = {
      username: form.email,
      email: form.email,
      first_name: form.first_name,
      last_name: form.last_name,
      role: form.role,
      approval_level: form.approval_level ? Number(form.approval_level) : null,
      approval_title: form.approval_title,
      department_id: form.department_id ? Number(form.department_id) : null,
      is_staff: form.role === 'ADMIN' || form.is_staff,
      is_active: form.is_active,
    };
    if (form.password) payload.password = form.password;
    return payload;
  };

  const save = async (event) => {
    event.preventDefault();
    try {
      if (editing) {
        await api.patch(`/users/${editing.id}/`, payloadFromForm());
        success('User updated');
      } else {
        await api.post('/users/', payloadFromForm());
        success('User created');
      }
      setModalOpen(false);
      await load();
    } catch {
      toastError('Unable to save user');
    }
  };

  const toggleActive = async (user) => {
    try {
      await api.patch(`/users/${user.id}/`, { is_active: !user.is_active });
      success(user.is_active ? 'User deactivated' : 'User activated');
      await load();
    } catch {
      toastError('Unable to update user status');
    }
  };

  const remove = async (user) => {
    try {
      await api.delete(`/users/${user.id}/`);
      success('User deleted');
      await load();
    } catch {
      toastError('Unable to delete user');
    }
  };

  return (
    <AdminLayout title="User Management">
      <div className="flex items-center justify-between">
        <h2 className="text-[32px] font-bold text-slate-950">User Management</h2>
        <button onClick={openCreate} className="inline-flex items-center gap-3 rounded-lg bg-[#073f73] px-6 py-3 text-lg font-bold text-white hover:bg-[#052f57]">
          <Plus className="h-5 w-5" /> Create User
        </button>
      </div>

      <section className="mt-8 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center"><LoadingSpinner /></div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-lg text-slate-600">
              <tr>
                <th className="px-6 py-4 font-bold">Name</th>
                <th className="px-6 py-4 font-bold">Role</th>
                <th className="px-6 py-4 font-bold">Department</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-5">
                    <p className="text-lg font-semibold text-slate-800">{user.name || user.email}</p>
                    <p className="text-sm text-slate-400">{user.email}</p>
                  </td>
                  <td className="px-6 py-5"><span className={`rounded-full px-3 py-1 text-sm font-bold ${roleClass(user.role)}`}>{user.role || 'PARTICIPANT'}</span></td>
                  <td className="px-6 py-5 text-lg text-slate-600">{user.department || '-'}</td>
                  <td className="px-6 py-5"><span className={`rounded-full px-3 py-1 text-sm font-bold ${user.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{user.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td className="px-6 py-5">
                    <div className="flex gap-4">
                      <button onClick={() => openEdit(user)} className="text-blue-500 hover:text-blue-700" aria-label="Edit user"><Edit3 className="h-5 w-5" /></button>
                      <button onClick={() => openEdit(user)} className="text-[#073f73] hover:text-blue-700" aria-label="Change password"><KeyRound className="h-5 w-5" /></button>
                      <button onClick={() => toggleActive(user)} className="text-red-500 hover:text-red-700" aria-label="Toggle status"><Power className="h-5 w-5" /></button>
                      <button onClick={() => remove(user)} className="text-red-500 hover:text-red-700" aria-label="Delete user"><Trash2 className="h-5 w-5" /></button>
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
          <form onSubmit={save} className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">{editing ? 'Edit User' : 'Create User'}</h3>
              <button type="button" onClick={() => setModalOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-bold text-slate-700">First Name
                <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-black outline-none focus:border-[#073f73]" />
              </label>
              <label className="block text-sm font-bold text-slate-700">Last Name
                <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-black outline-none focus:border-[#073f73]" />
              </label>
              <label className="block text-sm font-bold text-slate-700">Email
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-black outline-none focus:border-[#073f73]" />
              </label>
              <label className="block text-sm font-bold text-slate-700">Password {editing ? '(leave blank to keep)' : ''}
                <input required={!editing} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-black outline-none focus:border-[#073f73]" />
              </label>
              <label className="block text-sm font-bold text-slate-700">Role
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value, is_staff: e.target.value === 'ADMIN' })} className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-black outline-none focus:border-[#073f73]">
                  {roles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="block text-sm font-bold text-slate-700">Approval Level
                <select value={form.approval_level} onChange={(e) => setForm({ ...form, approval_level: e.target.value })} className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-black outline-none focus:border-[#073f73]">
                  <option value="">Not a sanctioner level</option>
                  <option value="1">1 - HoD</option>
                  <option value="2">2 - Dean</option>
                  <option value="3">3 - Principal</option>
                </select>
              </label>
              <label className="block text-sm font-bold text-slate-700">Approval Title
                <input value={form.approval_title} onChange={(e) => setForm({ ...form, approval_title: e.target.value.toUpperCase() })} placeholder="HOD / DEAN / PRINCIPAL" className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-black outline-none focus:border-[#073f73]" />
              </label>
              <label className="block text-sm font-bold text-slate-700">Department
                <select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })} className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-black outline-none focus:border-[#073f73]">
                  <option value="">No department</option>
                  {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-3 text-sm font-bold text-slate-700">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                Active account
              </label>
            </div>
            <button className="mt-6 w-full rounded-lg bg-[#073f73] py-3 font-bold text-white">Save User</button>
          </form>
        </div>
      ) : null}
    </AdminLayout>
  );
}
