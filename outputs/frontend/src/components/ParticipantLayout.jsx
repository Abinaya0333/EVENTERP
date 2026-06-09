import { NavLink, useNavigate } from 'react-router-dom';
import { Award, Bell, CalendarCheck2, List, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { label: 'Browse Events', path: '/participant', icon: List },
  { label: 'My Registrations', path: '/participant/registrations', icon: CalendarCheck2 },
  { label: 'Feedback & Certs', path: '/participant/feedback', icon: Award },
];

export default function ParticipantLayout({ title, children }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const name = profile?.name || profile?.email?.split('@')[0] || 'Participant';
  const initial = name.trim().charAt(0).toUpperCase() || 'P';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

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
                end={item.path === '/participant'}
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
              <p className="text-sm text-blue-100">Participant</p>
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
            <button type="button" className="text-slate-500 transition hover:text-slate-800" aria-label="Notifications">
              <Bell className="h-6 w-6" />
            </button>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#073f73] text-lg font-bold text-white shadow">
              {initial}
            </div>
          </div>
        </header>

        <main className="px-[30px] py-8">{children}</main>
      </div>
    </div>
  );
}
