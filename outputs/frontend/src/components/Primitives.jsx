import { AlertTriangle, Plus, RefreshCcw, Search } from 'lucide-react';

export function SectionHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-1">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{eyebrow}</p> : null}
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {description ? <p className="max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatCard({ label, value, hint, icon: Icon, tone = 'blue' }) {
  const toneMap = {
    blue: 'from-slate-950 to-slate-800 text-white',
    teal: 'from-teal-600 to-cyan-600 text-white',
    amber: 'from-amber-500 to-orange-500 text-white',
    emerald: 'from-emerald-600 to-emerald-500 text-white',
    rose: 'from-rose-600 to-pink-500 text-white',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="text-3xl font-semibold text-slate-900">{value}</p>
          {hint ? <p className="text-sm text-slate-500">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${toneMap[tone] || toneMap.blue}`}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function StatusPill({ value }) {
  const text = String(value ?? '').trim();
  const key = text.toLowerCase().replace(/\s+/g, '-');
  const map = {
    draft: 'bg-slate-100 text-slate-700',
    pending: 'bg-amber-100 text-amber-700',
    submitted: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-cyan-100 text-cyan-700',
    rejected: 'bg-rose-100 text-rose-700',
    cancelled: 'bg-slate-200 text-slate-700',
    registered: 'bg-blue-100 text-blue-700',
    waitlisted: 'bg-violet-100 text-violet-700',
    present: 'bg-emerald-100 text-emerald-700',
    absent: 'bg-rose-100 text-rose-700',
    todo: 'bg-slate-100 text-slate-700',
    'in-progress': 'bg-amber-100 text-amber-700',
    done: 'bg-emerald-100 text-emerald-700',
    blocked: 'bg-rose-100 text-rose-700',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${map[key] || 'bg-slate-100 text-slate-700'}`}>
      {text || 'Unknown'}
    </span>
  );
}

export function EmptyState({ title, description, action, icon: Icon = AlertTriangle }) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ToolbarInput({ icon: Icon = Search, ...props }) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        {...props}
        className={`w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 ${props.className || ''}`}
      />
    </div>
  );
}

export function IconButton({ icon: Icon, label, onClick, variant = 'default', type = 'button', className = '' }) {
  const styles = {
    default: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
    primary: 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800',
    ghost: 'border-transparent bg-transparent text-slate-700 hover:bg-slate-100',
    danger: 'border-rose-200 bg-white text-rose-700 hover:bg-rose-50',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${styles[variant]} ${className}`}
      title={label}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      <span>{label}</span>
    </button>
  );
}

export function MiniButton({ icon: Icon, label, onClick, variant = 'default', type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
        variant === 'primary'
          ? 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800'
          : variant === 'danger'
            ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
      }`}
      title={label}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      <span>{label}</span>
    </button>
  );
}
