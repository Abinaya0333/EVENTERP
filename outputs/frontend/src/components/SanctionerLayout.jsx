import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getNavItems } from '../lib/navigation';
import { getSanctionerLevel } from '../lib/sanctioner';
import NotificationBell from './NotificationBell';
import Sidebar from './Sidebar';

export default function SanctionerLayout({ title, subtitle, actions, children, navItems }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const role = profile?.role || 'SANCTIONER';
  const level = getSanctionerLevel(profile);
  const sidebarItems = useMemo(() => navItems || getNavItems(role), [navItems, role]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const initial = (profile?.name || profile?.email || 'S').trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f7fb]">
      <Sidebar
        items={sidebarItems}
        user={profile}
        onSignOut={handleSignOut}
        widthClassName="w-[208px]"
        roleBadgeLabel="Sanctioner"
        roleBadgeClassName="bg-[#e8f1fb] text-[#123b68]"
        footerRoleLabel={`${level} · Sanctioner`}
        activeItemClassName="bg-[#315a86] text-white shadow-md"
        inactiveItemClassName="text-white/85 hover:bg-white/10 hover:text-white"
      />

      <div className="min-h-screen lg:pl-[208px]">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-4 px-4 py-3 lg:px-6">
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-slate-700">{title}</p>
              {subtitle ? <p className="truncate text-xs text-slate-400">{subtitle}</p> : null}
            </div>

            <div className="flex items-center gap-2">
              <NotificationBell />
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0b3769] text-sm font-semibold text-white shadow-sm">
                {initial}
              </div>
              {actions}
            </div>
          </div>
        </header>

        <main className="px-4 py-5 lg:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
