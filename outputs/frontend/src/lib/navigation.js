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
  MessageSquareText,
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
  SANCTIONER: '/sanctioner',
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
    { label: 'Events', path: '/convener', icon: CalendarRange },
    { label: 'Create Event', path: '/convener/create', icon: CalendarPlus2 },
    { label: 'Template', path: '/convener/form-template', icon: ClipboardType },
    { label: 'Execute', path: '/convener/execute', icon: Sparkles },
    { label: 'Live Registration', path: '/convener/live', icon: QrCode },
    { label: 'Committees', path: '/convener/committees', icon: FolderKanban },
    { label: 'Meetings', path: '/convener/meetings', icon: CalendarClock },
    { label: 'Reports', path: '/convener/reports', icon: FileBarChart2 },
  ],
  SANCTIONER: [
    { label: 'Approvals', path: '/sanctioner', icon: BadgeCheck },
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
    { label: 'My Registrations', path: '/participant/registrations', icon: ClipboardList },
    { label: 'Feedback & Certificate', path: '/participant/feedback', icon: MessageSquareText },
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
