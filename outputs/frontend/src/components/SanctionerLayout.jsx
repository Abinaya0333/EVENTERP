<<<<<<< HEAD
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
=======
import { NavLink, useNavigate } from 'react-router-dom';
import { Bell, BookOpen, ClipboardList, FileText, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { label: 'Dashboard', path: '/sanctioner', icon: ClipboardList },
  { label: 'Approval History', path: '/sanctioner/history', icon: FileText },
  { label: 'Budget Ledger', path: '/sanctioner/budget', icon: BookOpen },
];

function sanctionerLabel(profile) {
  if (profile?.approval_title) return `${profile.approval_title} · Sanctioner`;
  if (profile?.approval_level === 2) return 'Dean · Sanctioner';
  if (profile?.approval_level === 3) return 'Principal · Sanctioner';
  return 'HoD · Sanctioner';
}

export default function SanctionerLayout({ title, children }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const name = profile?.name || profile?.email?.split('@')[0] || 'Sanctioner';
  const initial = name.trim().charAt(0).toUpperCase() || 'S';
>>>>>>> ccb9f562e7b424c9b22862534d480c809f89c3d9

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

<<<<<<< HEAD
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
=======
  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">
      <aside className="fixed left-0 top-0 z-30 flex h-screen w-[320px] flex-col bg-[#073f73] text-white">
        <div className="flex h-[90px] items-center gap-4 border-b border-white/10 px-6">
          <div className="h-[50px] w-[50px] overflow-hidden rounded-lg bg-white p-1.5">
            <img src="/cit-logo.jpeg" alt="CIT" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold leading-5">CIT Event Hub</p>
            <p className="truncate text-sm text-blue-100">Event Management System</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/sanctioner'}
                className={({ isActive }) =>
                  `flex h-[50px] items-center gap-4 rounded-lg px-4 text-[18px] font-semibold transition ${
                    isActive ? 'bg-white/18 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-5 w-5 ${isActive ? 'text-[#ffcc00]' : 'text-blue-100'}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/15 p-5">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffcc00] text-lg font-bold text-[#073f73]">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold">{name}</p>
              <p className="text-sm text-blue-100">{sanctionerLabel(profile)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-lg text-blue-100 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="min-h-screen pl-[320px]">
        <header className="sticky top-0 z-20 flex h-[70px] items-center justify-between border-b border-slate-200 bg-white px-[30px]">
          <h1 className="text-lg font-bold text-slate-700">{title}</h1>
          <div className="flex items-center gap-7">
            <Bell className="h-6 w-6 text-slate-500" />
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#073f73] text-lg font-bold text-white shadow">
              {initial}
>>>>>>> ccb9f562e7b424c9b22862534d480c809f89c3d9
            </div>
          </div>
        </header>

<<<<<<< HEAD
        <main className="px-4 py-5 lg:px-6">
          {children}
        </main>
=======
        <main className="px-[30px] py-8">{children}</main>
>>>>>>> ccb9f562e7b424c9b22862534d480c809f89c3d9
      </div>
    </div>
  );
}
