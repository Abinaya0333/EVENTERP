export const roleOptions = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'CONVENER', label: 'Convener' },
  { value: 'PARTICIPANT', label: 'Participant' },
  { value: 'SANCTIONER', label: 'Sanctioner' },
  { value: 'COMMITTEE_MEMBER', label: 'Committee Member' },
];

export const departmentLookups = [{ key: 'departments', endpoint: '/departments/' }];
export const eventLookups = [{ key: 'events', endpoint: '/events/' }, ...departmentLookups];
export const userLookups = [{ key: 'users', endpoint: '/users/' }, ...departmentLookups];
export const committeeLookups = [{ key: 'committees', endpoint: '/committees/' }, ...userLookups];
export const budgetLookups = [{ key: 'budgets', endpoint: '/budgets/' }, ...eventLookups];

export const eventStatusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING', label: 'Pending Approval' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'COMPLETED', label: 'Completed' },
];

export const registrationStatusOptions = [
  { value: 'REGISTERED', label: 'Registered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'WAITLISTED', label: 'Waitlisted' },
];

export const attendanceStatusOptions = [
  { value: 'PRESENT', label: 'Present' },
  { value: 'ABSENT', label: 'Absent' },
];

export const taskStatusOptions = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
  { value: 'BLOCKED', label: 'Blocked' },
];

export const budgetStatusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

export function createApiAction({ label, variant = 'default', icon, handler }) {
  return { label, variant, icon, onClick: handler };
}

export function patchStatusAction(resource, status, label, variant = 'default', icon = undefined) {
  return createApiAction({
    label: label || status,
    variant,
    icon,
    handler: async (item, { api, toastSuccess }) => {
      await api.patch(`${resource}${item.id}/`, { status });
      if (toastSuccess) toastSuccess(`${item.title || item.name || 'Record'} updated`);
    },
  });
}

export const userManagementPage = {
  title: 'User Management',
  description: 'Create accounts, set roles, and keep department assignments synchronized with the profile table.',
  listPath: '/users/',
  itemPath: '/users/',
  allowCreate: true,
  allowEdit: true,
  allowDelete: true,
  createLabel: 'Add user',
  emptyTitle: 'No users yet',
  emptyDescription: 'Add the first account to start managing roles and access.',
  searchPlaceholder: 'Search users',
  lookups: departmentLookups,
  fields: [
    { name: 'username', label: 'Username', type: 'text', placeholder: 'cit.admin' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'you@cit.edu' },
    { name: 'password', label: 'Password', type: 'password', placeholder: 'Set a password', skipIfEmpty: true },
    { name: 'first_name', label: 'First name', type: 'text' },
    { name: 'last_name', label: 'Last name', type: 'text' },
    { name: 'role', label: 'Role', type: 'select', options: roleOptions },
    { name: 'phone', label: 'Phone', type: 'text', placeholder: '+91...' },
    { name: 'department_id', label: 'Department', type: 'select', lookup: 'departments', optionLabelKey: 'name' },
    { name: 'is_staff', label: 'Admin privileges', type: 'checkbox', checkboxLabel: 'Is staff' },
    { name: 'is_active', label: 'Account active', type: 'checkbox', checkboxLabel: 'Is active' },
  ],
  columns: [
    { key: 'username', label: 'Username' },
    {
      key: 'name',
      label: 'Name',
      render: (row) => row.name || `${row.first_name || ''} ${row.last_name || ''}`.trim() || '—',
    },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', type: 'status' },
    { key: 'department', label: 'Department' },
    {
      key: 'is_active',
      label: 'Active',
      render: (row) => (row.is_active ? 'Yes' : 'No'),
    },
  ],
};

export const departmentPage = {
  title: 'Departments',
  description: 'Maintain the department directory used for event ownership, profiles, and filters across the platform.',
  listPath: '/departments/',
  itemPath: '/departments/',
  allowCreate: true,
  allowEdit: true,
  allowDelete: true,
  createLabel: 'Add department',
  emptyTitle: 'No departments yet',
  emptyDescription: 'Create the academic department records first.',
  searchPlaceholder: 'Search departments',
  fields: [
    { name: 'code', label: 'Code', type: 'text', placeholder: 'CSE' },
    { name: 'name', label: 'Name', type: 'text', placeholder: 'Computer Science and Engineering' },
  ],
  columns: [
    { key: 'code', label: 'Code' },
    { key: 'name', label: 'Department name' },
  ],
};

export const eventPage = {
  title: 'My Events',
  description: 'Create and manage events, track their approval status, and keep department ownership in sync.',
  listPath: '/events/',
  itemPath: '/events/',
  allowCreate: true,
  allowEdit: true,
  allowDelete: true,
  createLabel: 'Add event',
  emptyTitle: 'No events yet',
  emptyDescription: 'Create the first event to unlock registrations and workflows.',
  searchPlaceholder: 'Search events',
  lookups: departmentLookups,
  fields: [
    { name: 'title', label: 'Title', type: 'text', placeholder: 'Tech Symposium 2026' },
    { name: 'description', label: 'Description', type: 'textarea', rows: 4, placeholder: 'Describe the event' },
    { name: 'start_date', label: 'Start', type: 'datetime-local' },
    { name: 'end_date', label: 'End', type: 'datetime-local' },
    { name: 'location', label: 'Location', type: 'text', placeholder: 'Main auditorium' },
    { name: 'status', label: 'Status', type: 'select', options: eventStatusOptions },
    { name: 'department', label: 'Department', type: 'select', lookup: 'departments', optionLabelKey: 'name' },
  ],
  columns: [
    { key: 'title', label: 'Title' },
    { key: 'department_name', label: 'Department', render: (row) => row.department_name || row.department || '—' },
    { key: 'start_date', label: 'Start', type: 'datetime' },
    { key: 'end_date', label: 'End', type: 'datetime' },
    { key: 'status', label: 'Status', type: 'status' },
  ],
};

export const registrationPage = {
  title: 'Registrations',
  description: 'Register participants into events, update registration status, and keep attendance aligned.',
  listPath: '/registrations/',
  itemPath: '/registrations/',
  allowCreate: true,
  allowEdit: true,
  allowDelete: true,
  createLabel: 'Register participant',
  emptyTitle: 'No registrations yet',
  emptyDescription: 'Create or import registrations to populate this list.',
  searchPlaceholder: 'Search registrations',
  lookups: eventLookups,
  fields: [
    { name: 'event', label: 'Event', type: 'select', lookup: 'events', optionLabelKey: 'title' },
    { name: 'status', label: 'Status', type: 'select', options: registrationStatusOptions },
  ],
  columns: [
    { key: 'event_title', label: 'Event', render: (row) => row.event_title || row.event?.title || '—' },
    { key: 'user_name', label: 'User', render: (row) => row.user_name || row.user?.email || '—' },
    { key: 'registered_at', label: 'Registered', type: 'datetime' },
    { key: 'status', label: 'Status', type: 'status' },
  ],
};

export const attendancePage = {
  title: 'Attendance',
  description: 'Mark event attendance and keep a live view of present and absent members.',
  listPath: '/attendance/',
  itemPath: '/attendance/',
  allowCreate: true,
  allowEdit: true,
  allowDelete: true,
  createLabel: 'Mark attendance',
  emptyTitle: 'No attendance records yet',
  emptyDescription: 'Create the first attendance record for an event session.',
  searchPlaceholder: 'Search attendance',
  lookups: userLookups,
  fields: [
    { name: 'event', label: 'Event', type: 'select', lookup: 'events', optionLabelKey: 'title' },
    { name: 'user', label: 'User', type: 'select', lookup: 'users', optionLabelKey: 'email' },
    { name: 'status', label: 'Status', type: 'select', options: attendanceStatusOptions },
  ],
  columns: [
    { key: 'event_title', label: 'Event', render: (row) => row.event_title || row.event?.title || '—' },
    { key: 'user_name', label: 'User', render: (row) => row.user_name || row.user?.email || '—' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'marked_at', label: 'Marked at', type: 'datetime' },
  ],
};

export const feedbackPage = {
  title: 'Feedback',
  description: 'Collect participant ratings and comments after an event closes.',
  listPath: '/feedback/',
  itemPath: '/feedback/',
  allowCreate: true,
  allowEdit: true,
  allowDelete: true,
  createLabel: 'Add feedback',
  emptyTitle: 'No feedback yet',
  emptyDescription: 'Participants can leave feedback after attending an event.',
  searchPlaceholder: 'Search feedback',
  lookups: eventLookups,
  fields: [
    { name: 'event', label: 'Event', type: 'select', lookup: 'events', optionLabelKey: 'title' },
    { name: 'rating', label: 'Rating', type: 'number', placeholder: '1 - 5' },
    { name: 'comment', label: 'Comment', type: 'textarea', rows: 4, placeholder: 'Leave your note' },
  ],
  columns: [
    { key: 'event_title', label: 'Event', render: (row) => row.event_title || row.event?.title || '—' },
    { key: 'user_name', label: 'User', render: (row) => row.user_name || row.user?.email || '—' },
    { key: 'rating', label: 'Rating' },
    { key: 'comment', label: 'Comment', render: (row) => row.comment || '—' },
  ],
};

export const certificatePage = {
  title: 'Certificates',
  description: 'Track issued certificates and links shared with participants.',
  listPath: '/certificates/',
  itemPath: '/certificates/',
  allowCreate: true,
  allowEdit: true,
  allowDelete: true,
  createLabel: 'Issue certificate',
  emptyTitle: 'No certificates yet',
  emptyDescription: 'Issue the first certificate after an event is completed.',
  searchPlaceholder: 'Search certificates',
  lookups: eventLookups,
  fields: [
    { name: 'event', label: 'Event', type: 'select', lookup: 'events', optionLabelKey: 'title' },
    { name: 'certificate_url', label: 'Certificate URL', type: 'url', placeholder: 'https://...' },
  ],
  columns: [
    { key: 'event_title', label: 'Event', render: (row) => row.event_title || row.event?.title || '—' },
    { key: 'user_name', label: 'User', render: (row) => row.user_name || row.user?.email || '—' },
    { key: 'certificate_url', label: 'Certificate link', render: (row) => row.certificate_url || '—' },
    { key: 'issued_at', label: 'Issued at', type: 'datetime' },
  ],
};

export const committeePage = {
  title: 'Committees',
  description: 'Assign committee structures to events and keep member ownership visible.',
  listPath: '/committees/',
  itemPath: '/committees/',
  allowCreate: true,
  allowEdit: true,
  allowDelete: true,
  createLabel: 'Add committee',
  emptyTitle: 'No committees yet',
  emptyDescription: 'Create the first committee for an event.',
  searchPlaceholder: 'Search committees',
  lookups: eventLookups,
  fields: [
    { name: 'name', label: 'Name', type: 'text', placeholder: 'Hospitality' },
    { name: 'event', label: 'Event', type: 'select', lookup: 'events', optionLabelKey: 'title' },
    { name: 'description', label: 'Description', type: 'textarea', rows: 4 },
  ],
  columns: [
    { key: 'name', label: 'Committee' },
    { key: 'event_title', label: 'Event', render: (row) => row.event_title || row.event?.title || '—' },
    { key: 'description', label: 'Description', render: (row) => row.description || '—' },
  ],
};

export const committeeMemberPage = {
  title: 'Committee Members',
  description: 'Maintain member assignments and roles inside committees.',
  listPath: '/committee-members/',
  itemPath: '/committee-members/',
  allowCreate: true,
  allowEdit: true,
  allowDelete: true,
  createLabel: 'Add member',
  emptyTitle: 'No committee members yet',
  emptyDescription: 'Add users to committees and assign a role.',
  searchPlaceholder: 'Search committee members',
  lookups: committeeLookups,
  fields: [
    { name: 'committee', label: 'Committee', type: 'select', lookup: 'committees', optionLabelKey: 'name' },
    { name: 'user', label: 'User', type: 'select', lookup: 'users', optionLabelKey: 'email' },
    { name: 'role', label: 'Role', type: 'text', placeholder: 'Lead / Coordinator / Member' },
  ],
  columns: [
    { key: 'committee_name', label: 'Committee', render: (row) => row.committee_name || row.committee?.name || '—' },
    { key: 'user_name', label: 'User', render: (row) => row.user_name || row.user?.email || '—' },
    { key: 'role', label: 'Role' },
  ],
};

export const taskPage = {
  title: 'Tasks',
  description: 'Coordinate work items, deadlines, and ownership across committees and event teams.',
  listPath: '/tasks/',
  itemPath: '/tasks/',
  allowCreate: true,
  allowEdit: true,
  allowDelete: true,
  createLabel: 'Add task',
  emptyTitle: 'No tasks yet',
  emptyDescription: 'Create the first task to start tracking work.',
  searchPlaceholder: 'Search tasks',
  lookups: committeeLookups,
  fields: [
    { name: 'committee', label: 'Committee', type: 'select', lookup: 'committees', optionLabelKey: 'name' },
    { name: 'assigned_to', label: 'Assigned to', type: 'select', lookup: 'users', optionLabelKey: 'email' },
    { name: 'title', label: 'Title', type: 'text', placeholder: 'Print badges' },
    { name: 'description', label: 'Description', type: 'textarea', rows: 4 },
    { name: 'status', label: 'Status', type: 'select', options: taskStatusOptions },
    { name: 'deadline', label: 'Deadline', type: 'datetime-local' },
  ],
  columns: [
    { key: 'title', label: 'Task' },
    { key: 'committee_name', label: 'Committee', render: (row) => row.committee_name || row.committee?.name || '—' },
    { key: 'assigned_to_name', label: 'Assigned to', render: (row) => row.assigned_to_name || row.assigned_to?.email || '—' },
    { key: 'status', label: 'Status', type: 'status' },
    { key: 'deadline', label: 'Deadline', type: 'datetime' },
  ],
};

export const budgetPage = {
  title: 'Budget Ledger',
  description: 'Track event budgets and itemized spend in one place.',
  listPath: '/expenses/',
  itemPath: '/expenses/',
  allowCreate: true,
  allowEdit: true,
  allowDelete: true,
  createLabel: 'Add expense',
  emptyTitle: 'No expenses yet',
  emptyDescription: 'Record the first expense against a budget.',
  searchPlaceholder: 'Search expenses',
  lookups: budgetLookups,
  fields: [
    { name: 'budget', label: 'Budget', type: 'select', lookup: 'budgets', optionLabelKey: 'event_title' },
    { name: 'title', label: 'Title', type: 'text', placeholder: 'Printing and stationery' },
    { name: 'amount', label: 'Amount', type: 'number', placeholder: '0.00' },
    { name: 'category', label: 'Category', type: 'text', placeholder: 'Operations' },
    { name: 'date', label: 'Date', type: 'datetime-local' },
  ],
  columns: [
    { key: 'budget', label: 'Budget', render: (row) => row.budget_event_title || row.budget?.event_title || row.budget?.event?.title || '—' },
    { key: 'title', label: 'Expense' },
    { key: 'amount', label: 'Amount' },
    { key: 'category', label: 'Category' },
    { key: 'spent_by_name', label: 'Spent by', render: (row) => row.spent_by_name || row.spent_by?.email || '—' },
    { key: 'date', label: 'Date', type: 'datetime' },
  ],
};

export const budgetApprovalPage = {
  title: 'Approval Requests',
  description: 'Review submitted budgets and move them through the approval workflow.',
  listPath: '/budgets/?status=SUBMITTED',
  itemPath: '/budgets/',
  allowCreate: false,
  allowEdit: false,
  allowDelete: false,
  createLabel: 'New budget',
  emptyTitle: 'No pending approvals',
  emptyDescription: 'Submitted budgets will appear here for approval.',
  searchPlaceholder: 'Search budgets',
  lookups: eventLookups,
  fields: [],
  columns: [
    { key: 'event_title', label: 'Event', render: (row) => row.event_title || row.event?.title || '—' },
    { key: 'total_amount', label: 'Total' },
    { key: 'approved_amount', label: 'Approved' },
    { key: 'status', label: 'Status', type: 'status' },
  ],
};

export const budgetHistoryPage = {
  title: 'Approval History',
  description: 'Audit already-approved and rejected budgets.',
  listPath: '/budgets/',
  itemPath: '/budgets/',
  allowCreate: false,
  allowEdit: false,
  allowDelete: false,
  emptyTitle: 'No budget history yet',
  emptyDescription: 'Approved and rejected budgets will show up here.',
  searchPlaceholder: 'Search history',
  fields: [],
  columns: [
    { key: 'event_title', label: 'Event', render: (row) => row.event_title || row.event?.title || '—' },
    { key: 'total_amount', label: 'Total' },
    { key: 'approved_amount', label: 'Approved' },
    { key: 'status', label: 'Status', type: 'status' },
  ],
};

export const browseEventsPage = {
  title: 'Browse Events',
  description: 'See approved events and register with one click.',
  listPath: '/events/?status=APPROVED',
  itemPath: '/events/',
  allowCreate: false,
  allowEdit: false,
  allowDelete: false,
  emptyTitle: 'No approved events',
  emptyDescription: 'Approved events will appear here when convener and admin workflows are complete.',
  searchPlaceholder: 'Search events',
  fields: [],
  columns: [
    { key: 'title', label: 'Title' },
    { key: 'department_name', label: 'Department', render: (row) => row.department_name || row.department || '—' },
    { key: 'location', label: 'Location' },
    { key: 'start_date', label: 'Start', type: 'datetime' },
    { key: 'status', label: 'Status', type: 'status' },
  ],
};

export const myRegistrationsPage = {
  title: 'My Registrations',
  description: 'Review the events you have registered for and cancel entries if needed.',
  listPath: '/registrations/',
  itemPath: '/registrations/',
  allowCreate: false,
  allowEdit: false,
  allowDelete: false,
  emptyTitle: 'No registrations yet',
  emptyDescription: 'Register for approved events to see them here.',
  searchPlaceholder: 'Search registrations',
  fields: [],
  columns: [
    { key: 'event_title', label: 'Event', render: (row) => row.event_title || row.event?.title || '—' },
    { key: 'registered_at', label: 'Registered', type: 'datetime' },
    { key: 'status', label: 'Status', type: 'status' },
  ],
};

export const myTasksPage = {
  title: 'My Tasks',
  description: 'Keep your assigned committee tasks moving and close them when they are complete.',
  listPath: '/tasks/',
  itemPath: '/tasks/',
  allowCreate: false,
  allowEdit: false,
  allowDelete: false,
  emptyTitle: 'No tasks assigned',
  emptyDescription: 'Tasks assigned to your account will appear here.',
  searchPlaceholder: 'Search tasks',
  fields: [],
  columns: [
    { key: 'title', label: 'Task' },
    { key: 'committee_name', label: 'Committee', render: (row) => row.committee_name || row.committee?.name || '—' },
    { key: 'deadline', label: 'Deadline', type: 'datetime' },
    { key: 'status', label: 'Status', type: 'status' },
  ],
};

export const eventReportPage = {
  title: 'Event Reports',
  description: 'Document close-out reports and event outcomes for the archive.',
  listPath: '/event-reports/',
  itemPath: '/event-reports/',
  allowCreate: true,
  allowEdit: true,
  allowDelete: true,
  createLabel: 'Add report',
  emptyTitle: 'No event reports yet',
  emptyDescription: 'Create the first report for a closed event.',
  searchPlaceholder: 'Search reports',
  lookups: eventLookups,
  fields: [
    { name: 'event', label: 'Event', type: 'select', lookup: 'events', optionLabelKey: 'title' },
    { name: 'report', label: 'Report', type: 'textarea', rows: 6, placeholder: 'Summarize the event outcomes' },
  ],
  columns: [
    { key: 'event_title', label: 'Event', render: (row) => row.event_title || row.event?.title || '—' },
    { key: 'report', label: 'Report', render: (row) => row.report || '—' },
    { key: 'created_at', label: 'Created', type: 'datetime' },
  ],
};
