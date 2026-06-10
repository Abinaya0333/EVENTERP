export function MetricCard({ label, value, hint, icon: Icon, accentClassName = 'bg-[#0b3769]' }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
          {hint ? <p className="mt-1 text-sm text-slate-500">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accentClassName}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function InfoBanner({ badge, title, description, accentClassName = 'bg-[#e8f1fb] text-[#123b68]' }) {
  return (
    <div className="rounded-2xl border border-[#d9e5f4] bg-[#f4f8fe] px-4 py-4 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        {badge ? (
          <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${accentClassName}`}>{badge}</span>
        ) : null}
        <div className="min-w-0 text-sm text-slate-700">
          {title ? <p className="font-medium text-slate-700">{title}</p> : null}
          {description ? <p className="mt-0.5 text-slate-500">{description}</p> : null}
        </div>
      </div>
    </div>
  );
}
