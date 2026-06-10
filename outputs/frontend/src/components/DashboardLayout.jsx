import { LogOut, Search } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getNavItems, getRoleLabel, APP_NAME, APP_SUBTITLE } from '../lib/navigation';
import NotificationBell from './NotificationBell';
import Sidebar from './Sidebar';
import { IconButton, ToolbarInput } from './Primitives';

export default function DashboardLayout({ title, subtitle, actions, children, navItems }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const role = profile?.role || 'PARTICIPANT';
  const sidebarItems = useMemo(() => navItems || getNavItems(role), [navItems, role]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50">
      <Sidebar items={sidebarItems} user={profile} onSignOut={handleSignOut} />

      <div className="min-h-screen lg:pl-[300px]">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-4 lg:px-8">
            <div className="flex min-w-0 items-center gap-4">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 lg:hidden"
                onClick={() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}
              >
                <span className="sr-only">Toggle sidebar</span>
                <span className="text-xl leading-none">&#8801;</span>
              </button>
              <div className="min-w-0">
                <p className="truncate text-[15px] font-bold text-slate-900">{APP_NAME}</p>
                <p className="truncate text-xs text-slate-500">{APP_SUBTITLE}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden min-w-[260px] xl:block">
                <ToolbarInput icon={Search} placeholder="Search this page" />
              </div>
              <NotificationBell />
              <IconButton icon={LogOut} label="Sign out" onClick={handleSignOut} />
              {actions}
            </div>
          </div>
        </header>

        <main className="px-4 py-6 lg:px-8">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{getRoleLabel(role)}</p>
              <h1 className="mt-1 text-2xl font-semibold text-slate-900">{title}</h1>
              {subtitle ? <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-600">{subtitle}</p> : null}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
