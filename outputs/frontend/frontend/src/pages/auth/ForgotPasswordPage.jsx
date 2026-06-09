import { useState } from 'react';
import { ArrowLeft, Copy, Mail, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-xs text-red-500">{msg}</p>;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const emailError = !email ? 'Email is required' : !validateEmail(email) ? 'Enter a valid email address' : '';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched(true);
    setError('');
    if (emailError) return;

    setLoading(true);
    try {
      const { data } = await api.post('/password-reset/request/', { email });
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(err.response?.data?.email?.[0] || err.response?.data?.detail || 'Unable to generate a reset link');
    } finally {
      setLoading(false);
    }
  };

  const goToReset = () => {
    if (!result?.uid || !result?.token) return;
    navigate(`/reset-password?uid=${encodeURIComponent(result.uid)}&token=${encodeURIComponent(result.token)}`);
  };

  const resetLink = result?.uid && result?.token
    ? `${window.location.origin}/reset-password?uid=${encodeURIComponent(result.uid)}&token=${encodeURIComponent(result.token)}`
    : '';

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d1b2e] p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="px-8 pb-6 pt-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-bold text-cit-blue">Reset your password</h1>
          <p className="mt-2 text-sm text-slate-500">We’ll generate a local reset link for the account you enter.</p>
        </div>

        <div className="px-8 pb-8">
          {result ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                Password reset link generated for <span className="font-semibold">{result.email}</span>.
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Reset link</p>
                <p className="break-all text-sm text-slate-700">{resetLink}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={goToReset}
                  className="inline-flex items-center gap-2 rounded-xl bg-cit-blue px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
                >
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                  Open reset form
                </button>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(resetLink)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <Copy className="h-4 w-4" />
                  Copy link
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    onBlur={() => setTouched(true)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    placeholder="you@cit.edu"
                    autoComplete="email"
                  />
                </div>
                {touched ? <FieldError msg={emailError} /> : null}
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
                {loading ? <LoadingSpinner size="sm" /> : 'Generate reset link'}
              </button>
            </form>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5 text-sm">
            <Link to="/login" className="inline-flex items-center gap-2 text-slate-600 transition hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
