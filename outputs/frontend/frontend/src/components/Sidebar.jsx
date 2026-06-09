import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { APP_NAME, APP_SUBTITLE } from '../lib/navigation';

export default function Sidebar({ items = [], user, onSignOut, className = '', compact = false }) {
  return (
    <aside
      className={`fixed left-0 top-0 z-30 flex h-screen w-[300px] flex-col overflow-hidden border-slate-200 bg-[#0b3769] text-white ${
        compact ? 'rounded-r-2xl border-r p-4 shadow-sm' : 'border-r'
      } ${className}`}
    >
      <div className="border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-lg bg-white p-1.5 shadow-lg">
            <img src="/cit-logo.jpeg" alt="CIT" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold leading-5">CIT Event Hub</p>
            <p className="truncate text-[11px] font-medium text-[#ffd34d]">{APP_NAME}</p>
          </div>
        </div>
      </div>

      <div className="border-b border-white/10 px-4 py-3">
        <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0b3769]">
          {user?.role || 'Administrator'}
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end !== false}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-[#ffc72c] text-[#0b3769] shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 p-4">
        <div className="mb-4 rounded-2xl bg-white/5 p-3">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">Signed in as</p>
          <p className="mt-1 truncate text-sm font-semibold text-white">{user?.name || user?.email || 'User'}</p>
          <p className="text-xs text-white/60">{user?.role || 'PARTICIPANT'}</p>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
