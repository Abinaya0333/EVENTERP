import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { APP_NAME } from '../lib/navigation';

export default function Sidebar({
  items = [],
  user,
  onSignOut,
  className = '',
  compact = false,
  widthClassName = 'w-[300px]',
  roleBadgeLabel,
  roleBadgeClassName = 'bg-white text-[#0b3769]',
  footerRoleLabel,
  activeItemClassName = 'bg-[#ffc72c] text-[#0b3769] shadow-md',
  inactiveItemClassName = 'text-white/80 hover:bg-white/10 hover:text-white',
}) {
  return (
    <aside
      className={`fixed left-0 top-0 z-30 flex h-screen ${widthClassName} shrink-0 flex-col overflow-y-auto overflow-x-hidden border-r border-slate-200 bg-[#0b3769] text-white shadow-2xl ${
        compact ? 'rounded-r-2xl p-4' : ''
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
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${roleBadgeClassName}`}>
          {roleBadgeLabel || user?.role || 'Administrator'}
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
                  isActive ? activeItemClassName : inactiveItemClassName
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
        <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffc72c] text-sm font-bold text-[#0b3769]">
            {(user?.name || user?.email || 'U').trim().charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user?.name || user?.email || 'User'}</p>
            <p className="truncate text-xs text-white/65">{footerRoleLabel || user?.role || 'PARTICIPANT'}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="mt-4 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
