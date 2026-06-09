import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-xs text-red-500">{msg}</p>;
}

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const uid = params.get('uid') || '';
  const token = params.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({ password: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const passwordError = !newPassword
    ? 'Password is required'
    : newPassword.length < 8
      ? 'Use at least 8 characters'
      : '';
  const confirmError = !confirmPassword
    ? 'Please confirm your password'
    : confirmPassword !== newPassword
      ? 'Passwords do not match'
      : '';

  const canSubmit = useMemo(() => Boolean(uid && token && !passwordError && !confirmError), [uid, token, passwordError, confirmError]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched({ password: true, confirm: true });
    setError('');
    if (!canSubmit) return;

    setLoading(true);
    try {
      await api.post('/password-reset/confirm/', {
        uid,
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setDone(true);
    } catch (err) {
      const data = err.response?.data || {};
      setError(data.uid?.[0] || data.token?.[0] || data.new_password?.[0] || data.confirm_password?.[0] || data.detail || 'Unable to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!uid || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d1b2e] p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
            <KeyRound className="h-8 w-8" />
          </div>
          <h1 className="text-center text-xl font-bold text-cit-blue">Missing reset link</h1>
          <p className="mt-2 text-center text-sm text-slate-500">
            Open the password reset page from the link generated on the previous screen.
          </p>
          <div className="mt-6 flex justify-center">
            <Link to="/forgot-password" className="inline-flex items-center gap-2 rounded-xl bg-cit-blue px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-900">
              <ArrowLeft className="h-4 w-4" />
              Go to reset request
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d1b2e] p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="px-8 pb-6 pt-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-cit-blue">Create a new password</h1>
          <p className="mt-2 text-sm text-slate-500">This update applies to the account tied to your reset token.</p>
        </div>

        <div className="px-8 pb-8">
          {done ? (
            <div className="space-y-5 text-center">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-5 text-emerald-900">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
                <p className="mt-3 text-sm font-medium">Your password has been updated successfully.</p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-cit-blue px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">New password</span>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                </div>
                {touched.password ? <FieldError msg={passwordError} /> : null}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Confirm password</span>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, confirm: true }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                  />
                </div>
                {touched.confirm ? <FieldError msg={confirmError} /> : null}
              </label>

              {error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-cit-blue px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Update password'}
              </button>
            </form>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5 text-sm">
            <button type="button" onClick={() => navigate('/forgot-password')} className="inline-flex items-center gap-2 text-slate-600 transition hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" />
              Request a new link
            </button>
            <span className="text-xs text-slate-400">Reset token verified locally</span>
          </div>
        </div>
      </div>
    </div>
  );
}
