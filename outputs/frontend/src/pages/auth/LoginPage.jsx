import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{msg}
    </p>
  );
}

function getErrorMessage(error, fallback) {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error.detail) return error.detail;
  if (error.message) return error.message;
  const firstValue = Object.values(error)[0];
  if (Array.isArray(firstValue)) return firstValue[0];
  if (typeof firstValue === 'string') return firstValue;
  return fallback;
}

export default function LoginPage() {
  const [tab, setTab] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sign-in
  const [siEmail, setSiEmail] = useState('');
  const [siPassword, setSiPassword] = useState('');
  const [siTouched, setSiTouched] = useState({ email: false, password: false });

  // Sign-up
  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suConfirm, setSuConfirm] = useState('');
  const [suTouched, setSuTouched] = useState({ name: false, email: false, password: false, confirm: false });

  const { signIn, signUp } = useAuth();
  const { error: toastError, success } = useToast();
  const navigate = useNavigate();

  const siErrors = {
    email:    !siEmail ? 'Email is required' : !validateEmail(siEmail) ? 'Enter a valid email address' : '',
    password: !siPassword ? 'Password is required' : siPassword.length < 6 ? 'Password must be at least 6 characters' : '',
  };
  const siValid = !siErrors.email && !siErrors.password;

  const suErrors = {
    name:     !suName.trim() ? 'Full name is required' : '',
    email:    !suEmail ? 'Email is required' : !validateEmail(suEmail) ? 'Enter a valid email address' : '',
    password: !suPassword ? 'Password is required'
            : suPassword.length < 8 ? 'Password must be at least 8 characters'
            : !/[A-Z]/.test(suPassword) ? 'Include at least one uppercase letter'
            : !/[0-9]/.test(suPassword) ? 'Include at least one number'
            : '',
    confirm: !suConfirm ? 'Please confirm your password' : suConfirm !== suPassword ? 'Passwords do not match' : '',
  };
  const suValid = !Object.values(suErrors).some(Boolean);

  const passwordStrength = (pw) => {
    if (!pw) return null;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: 'Weak',   color: 'bg-red-400',   width: 'w-1/4' };
    if (score === 2) return { label: 'Fair',   color: 'bg-orange-400',width: 'w-2/4' };
    if (score === 3) return { label: 'Good',   color: 'bg-yellow-400',width: 'w-3/4' };
    return              { label: 'Strong', color: 'bg-green-500', width: 'w-full'  };
  };
  const strength = suTouched.password ? passwordStrength(suPassword) : null;

  const handleSignIn = async (e) => {
    e.preventDefault();
    setSiTouched({ email: true, password: true });
    if (!siValid) return;
    setLoading(true);
    const { error } = await signIn(siEmail, siPassword);
    setLoading(false);
    if (error) { toastError(getErrorMessage(error, 'Invalid credentials')); return; }
    navigate('/dashboard');
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setSuTouched({ name: true, email: true, password: true, confirm: true });
    if (!suValid) return;
    setLoading(true);
    const { error } = await signUp(suEmail, suPassword, suName);
    setLoading(false);
    if (error) { toastError(getErrorMessage(error, 'Registration failed')); return; }
    success('Account created! You can now sign in.');
    setTab('signin');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#071631] px-4 py-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,_rgba(20,62,121,0.5)_0%,_rgba(7,22,49,0.95)_58%,_#071631_100%)]" />

      <div className="relative flex min-h-[calc(100vh-3rem)] flex-col items-center justify-center">
        <div className="w-full max-w-[560px] overflow-hidden rounded-[26px] bg-white shadow-[0_28px_70px_rgba(0,0,0,0.34)]">
          <div className="px-8 pb-8 pt-12 text-center">
            <div className="mx-auto mb-6 h-[118px] w-[118px] rounded-2xl bg-white p-2.5 shadow-[0_10px_28px_rgba(15,23,42,0.18)]">
              <img
                src="/cit-logo.jpeg"
                alt="Chennai Institute of Technology"
                className="h-full w-full rounded-xl object-contain"
              />
            </div>
            <h1 className="text-[28px] font-bold leading-tight text-[#0b3769]">Chennai Institute of Technology</h1>
            <p className="mt-2 text-[18px] text-slate-500">Event Management Platform</p>
          </div>

          <div className="border-t border-slate-100 px-8 pt-8">
            <div className="flex border-b border-slate-200">
              {[{ key: 'signin', label: 'Sign In' }, { key: 'signup', label: 'Create Account' }].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
                    tab === t.key
                      ? 'border-b-2 border-[#0b3769] text-[#0b3769]'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="px-0 py-8">
              {tab === 'signin' ? (
                <form onSubmit={handleSignIn} className="space-y-5" noValidate>
                  <div>
                    <label className="mb-1.5 block text-[16px] font-medium text-slate-700">Email</label>
                    <input
                      type="email"
                      value={siEmail}
                      onChange={(e) => setSiEmail(e.target.value)}
                      onBlur={() => setSiTouched((p) => ({ ...p, email: true }))}
                      className="w-full rounded-xl border border-slate-200 bg-[#eef3fb] px-4 py-3 text-[16px] text-black placeholder:text-slate-400 outline-none transition focus:border-[#0b3769] focus:ring-2 focus:ring-[#0b3769]/15"
                      placeholder="you@cit.edu"
                      autoComplete="email"
                    />
                    {siTouched.email && <FieldError msg={siErrors.email} />}
                  </div>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="block text-[16px] font-medium text-slate-700">Password</label>
                      <Link to="/forgot-password" className="text-[14px] font-medium text-[#0b3769] hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={siPassword}
                        onChange={(e) => setSiPassword(e.target.value)}
                        onBlur={() => setSiTouched((p) => ({ ...p, password: true }))}
                        className="w-full rounded-xl border border-slate-200 bg-[#eef3fb] px-4 py-3 pr-11 text-[16px] text-black placeholder:text-slate-400 outline-none transition focus:border-[#0b3769] focus:ring-2 focus:ring-[#0b3769]/15"
                        placeholder="••••••••"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {siTouched.password && <FieldError msg={siErrors.password} />}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[#0b3769] py-3.5 text-[16px] font-semibold text-white shadow-[0_12px_24px_rgba(11,55,105,0.25)] transition hover:bg-[#092b52]"
                  >
                    {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-4" noValidate>
                  <div>
                    <label className="mb-1.5 block text-[16px] font-medium text-slate-700">Full Name</label>
                    <input
                      type="text"
                      value={suName}
                      onChange={(e) => setSuName(e.target.value)}
                      onBlur={() => setSuTouched((p) => ({ ...p, name: true }))}
                      className="w-full rounded-xl border border-slate-200 bg-[#eef3fb] px-4 py-3 text-[16px] text-black placeholder:text-slate-400 outline-none transition focus:border-[#0b3769] focus:ring-2 focus:ring-[#0b3769]/15"
                      placeholder="Your full name"
                    />
                    {suTouched.name && <FieldError msg={suErrors.name} />}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[16px] font-medium text-slate-700">Email</label>
                    <input
                      type="email"
                      value={suEmail}
                      onChange={(e) => setSuEmail(e.target.value)}
                      onBlur={() => setSuTouched((p) => ({ ...p, email: true }))}
                      className="w-full rounded-xl border border-slate-200 bg-[#eef3fb] px-4 py-3 text-[16px] text-black placeholder:text-slate-400 outline-none transition focus:border-[#0b3769] focus:ring-2 focus:ring-[#0b3769]/15"
                      placeholder="you@example.com"
                    />
                    {suTouched.email && <FieldError msg={suErrors.email} />}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[16px] font-medium text-slate-700">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={suPassword}
                        onChange={(e) => setSuPassword(e.target.value)}
                        onBlur={() => setSuTouched((p) => ({ ...p, password: true }))}
                        className="w-full rounded-xl border border-slate-200 bg-[#eef3fb] px-4 py-3 pr-11 text-[16px] text-black placeholder:text-slate-400 outline-none transition focus:border-[#0b3769] focus:ring-2 focus:ring-[#0b3769]/15"
                        placeholder="Min 8 chars, uppercase & number"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {strength && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div className={`h-full rounded-full transition-all ${strength.color} ${strength.width}`} />
                        </div>
                        <span className="w-12 text-right text-xs text-slate-500">{strength.label}</span>
                      </div>
                    )}
                    {suTouched.password && <FieldError msg={suErrors.password} />}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[16px] font-medium text-slate-700">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={suConfirm}
                        onChange={(e) => setSuConfirm(e.target.value)}
                        onBlur={() => setSuTouched((p) => ({ ...p, confirm: true }))}
                        className="w-full rounded-xl border border-slate-200 bg-[#eef3fb] px-4 py-3 pr-11 text-[16px] text-black placeholder:text-slate-400 outline-none transition focus:border-[#0b3769] focus:ring-2 focus:ring-[#0b3769]/15"
                        placeholder="Re-enter password"
                      />
                      {suConfirm && suConfirm === suPassword && (
                        <CheckCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                      )}
                    </div>
                    {suTouched.confirm && <FieldError msg={suErrors.confirm} />}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-1 w-full rounded-xl bg-[#0b3769] py-3.5 text-[16px] font-semibold text-white shadow-[0_12px_24px_rgba(11,55,105,0.25)] transition hover:bg-[#092b52]"
                  >
                    {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-blue-200/75">
          © 2026 Chennai Institute of Technology. All rights reserved.
        </p>
      </div>
    </div>
  );
}
