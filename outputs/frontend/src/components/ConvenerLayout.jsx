import { LogOut, MessageSquareMore } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getNavItems } from '../lib/navigation';
import NotificationBell from './NotificationBell';
import Sidebar from './Sidebar';
import { IconButton } from './Primitives';

export default function ConvenerLayout({ title, subtitle, actions, children, navItems }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const role = profile?.role || 'CONVENER';
  const sidebarItems = useMemo(() => navItems || getNavItems(role), [navItems, role]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f5f7fb]">
      <Sidebar
        items={sidebarItems}
        user={profile}
        onSignOut={handleSignOut}
        widthClassName="w-[208px]"
        roleBadgeLabel="Convener"
        roleBadgeClassName="bg-[#e8f1fb] text-[#123b68]"
        footerRoleLabel="Event Convener"
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
              <IconButton icon={MessageSquareMore} label="Messages" variant="ghost" />
              <IconButton icon={LogOut} label="Sign out" onClick={handleSignOut} variant="ghost" />
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
