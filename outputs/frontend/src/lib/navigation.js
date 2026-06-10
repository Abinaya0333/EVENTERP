import {
  BadgeCheck,
  BellRing,
  Building2,
  CalendarDays,
  CalendarPlus2,
  ClipboardCheck,
  ClipboardList,
  FileClock,
  FileText,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  UsersRound,
  WalletCards,
  UserRoundSearch,
  BookOpenCheck,
  ClipboardPen,
  MessageSquareMore,
  QrCode,
  CheckCircle2,
  CalendarRange,
  Presentation,
  FileBarChart2,
  ClipboardType,
  ClipboardX,
  Receipt,
  CalendarClock,
  Clipboard,
  FileBadge2,
} from 'lucide-react';

export const APP_NAME = 'Chennai Institute of Technology';
export const APP_SUBTITLE = 'Event Management System';

export const ROLE_LABELS = {
  ADMIN: 'Admin',
  CONVENER: 'Convener',
  PARTICIPANT: 'Participant',
  SANCTIONER: 'Sanctioner',
  COMMITTEE_MEMBER: 'Committee Member',
};

export const ROLE_HOME = {
  ADMIN: '/admin',
  CONVENER: '/convener',
  PARTICIPANT: '/participant',
  SANCTIONER: '/sanctioner/dashboard',
  COMMITTEE_MEMBER: '/committee',
};

export const NAV_ITEMS = {
  ADMIN: [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: UsersRound },
    { label: 'Departments', path: '/admin/departments', icon: Building2 },
    { label: 'Permissions', path: '/admin/permissions', icon: ShieldCheck },
    { label: 'Audit Log', path: '/admin/audit', icon: FileClock },
  ],
  CONVENER: [
    { label: 'Dashboard', path: '/convener', icon: LayoutDashboard },
    { label: 'Event Details', path: '/convener/details', icon: FileText },
    { label: 'Create Event', path: '/convener/create', icon: CalendarPlus2 },
    { label: 'Event Schedule', path: '/convener/schedule', icon: CalendarRange },
    { label: 'Registration Template', path: '/convener/form-template', icon: ClipboardType },
    { label: 'Live Registration', path: '/convener/live', icon: QrCode },
    { label: 'Registration Details', path: '/convener/registrations', icon: ClipboardList },
    { label: 'Teams', path: '/convener/teams', icon: BookOpenCheck },
    { label: 'Committees & Duties', path: '/convener/committees', icon: FolderKanban },
    { label: 'Approvals', path: '/convener/execute', icon: BadgeCheck },
    { label: 'Resource Persons', path: '/convener/resource-persons', icon: UsersRound },
    { label: 'Expenses Ledger', path: '/convener/expenses', icon: WalletCards },
    { label: 'Meetings & Attendance', path: '/convener/meetings', icon: CalendarClock },
    { label: 'Reports (NAAC)', path: '/convener/reports', icon: FileBarChart2 },
  ],
  SANCTIONER: [
    { label: 'Dashboard', path: '/sanctioner/dashboard', icon: BadgeCheck },
    { label: 'History', path: '/sanctioner/history', icon: ClipboardCheck },
    { label: 'Budget Ledger', path: '/sanctioner/budget', icon: WalletCards },
  ],
  COMMITTEE_MEMBER: [
    { label: 'Tasks', path: '/committee', icon: ListChecks },
    { label: 'Attendance', path: '/committee/attendance', icon: CheckCircle2 },
    { label: 'Meetings', path: '/committee/meetings', icon: Presentation },
  ],
  PARTICIPANT: [
    { label: 'Browse Events', path: '/participant', icon: BookOpenCheck },
    { label: 'Registrations', path: '/participant/registrations', icon: ClipboardList },
    { label: 'Feedback & Certificate', path: '/participant/feedback', icon: ReceiptText },
  ],
};

export const ROLE_HOME_ITEMS = Object.fromEntries(
  Object.entries(ROLE_HOME).map(([role, path]) => [role, { role, path }]),
);

export function getRoleHome(role) {
  return ROLE_HOME[role] || '/dashboard';
}

export function getRoleLabel(role) {
  return ROLE_LABELS[role] || 'Participant';
}

export function getNavItems(role) {
  return NAV_ITEMS[role] || [];
}

export function canAccessRole(role, allowedRoles = []) {
  if (!allowedRoles.length) return true;
  return role === 'ADMIN' || allowedRoles.includes(role);
}
