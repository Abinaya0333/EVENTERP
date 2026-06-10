import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardRedirect from './pages/DashboardRedirect';

import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import PermissionMatrix from './pages/admin/PermissionMatrix';
import Departments from './pages/admin/Departments';
import AuditLogs from './pages/admin/AuditLogs';

import ConvenerDashboard from './pages/convener/ConvenerDashboard';
import EventDetails from './pages/convener/EventDetails';
import EventSchedule from './pages/convener/EventSchedule';
import MyEvents from './pages/convener/MyEvents';
import CreateEvent from './pages/convener/CreateEvent';
import RegistrationFormTemplate from './pages/convener/RegistrationFormTemplate';
import ExecutePanel from './pages/convener/ExecutePanel';
import LiveRegistration from './pages/convener/LiveRegistration';
import CommitteeTasks from './pages/convener/CommitteeTasks';
import Teams from './pages/convener/Teams';
import ResourcePersons from './pages/convener/ResourcePersons';
import ConvenerMeetings from './pages/convener/ConvenerMeetings';
import CloseEventReports from './pages/convener/CloseEventReports';
import RegistrationDetails from './pages/convener/RegistrationDetails';
import ExpensesLedger from './pages/convener/ExpensesLedger';

import ApprovalRequests from './pages/sanctioner/ApprovalRequests';
import ApprovalHistory from './pages/sanctioner/ApprovalHistory';
import BudgetLedger from './pages/sanctioner/BudgetLedger';

import MyTasks from './pages/committee/MyTasks';
import Attendance from './pages/committee/Attendance';
import CommitteeMeetings from './pages/committee/CommitteeMeetings';

import BrowseEvents from './pages/participant/BrowseEvents';
import RegisterEvent from './pages/participant/RegisterEvent';
import MyRegistrations from './pages/participant/MyRegistrations';
import FeedbackCertificate from './pages/participant/FeedbackCertificate';
import ParticipantDashboard from './pages/participant/ParticipantDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><UserManagement /></ProtectedRoute>} />
            <Route path="/admin/departments" element={<ProtectedRoute allowedRoles={['ADMIN']}><Departments /></ProtectedRoute>} />
            <Route path="/admin/permissions" element={<ProtectedRoute allowedRoles={['ADMIN']}><PermissionMatrix /></ProtectedRoute>} />
            <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={['ADMIN']}><AuditLogs /></ProtectedRoute>} />

<<<<<<< HEAD
            <Route path="/convener" element={<ProtectedRoute allowedRoles={['CONVENER', 'ADMIN']}><ConvenerDashboard /></ProtectedRoute>} />
            <Route path="/convener/dashboard" element={<ProtectedRoute allowedRoles={['CONVENER', 'ADMIN']}><ConvenerDashboard /></ProtectedRoute>} />
            <Route path="/convener/details" element={<ProtectedRoute allowedRoles={['CONVENER', 'ADMIN']}><EventDetails /></ProtectedRoute>} />
            <Route path="/convener/schedule" element={<ProtectedRoute allowedRoles={['CONVENER', 'ADMIN']}><EventSchedule /></ProtectedRoute>} />
            <Route path="/convener/events" element={<ProtectedRoute allowedRoles={['CONVENER', 'ADMIN']}><MyEvents /></ProtectedRoute>} />
=======
            <Route path="/convener" element={<Navigate to="/convener/dashboard" replace />} />
            <Route path="/convener/dashboard" element={<ProtectedRoute allowedRoles={['CONVENER', 'ADMIN']}><MyEvents /></ProtectedRoute>} />
>>>>>>> ccb9f562e7b424c9b22862534d480c809f89c3d9
            <Route path="/convener/create" element={<ProtectedRoute allowedRoles={['CONVENER', 'ADMIN']}><CreateEvent /></ProtectedRoute>} />
            <Route path="/convener/form-template" element={<ProtectedRoute allowedRoles={['CONVENER', 'ADMIN']}><RegistrationFormTemplate /></ProtectedRoute>} />
            <Route path="/convener/execute" element={<ProtectedRoute allowedRoles={['CONVENER', 'ADMIN']}><ExecutePanel /></ProtectedRoute>} />
            <Route path="/convener/live" element={<ProtectedRoute allowedRoles={['CONVENER', 'ADMIN']}><LiveRegistration /></ProtectedRoute>} />
            <Route path="/convener/registrations" element={<ProtectedRoute allowedRoles={['CONVENER', 'ADMIN']}><RegistrationDetails /></ProtectedRoute>} />
            <Route path="/convener/teams" element={<ProtectedRoute allowedRoles={['CONVENER', 'ADMIN']}><Teams /></ProtectedRoute>} />
            <Route path="/convener/committees" element={<ProtectedRoute allowedRoles={['CONVENER', 'ADMIN']}><CommitteeTasks /></ProtectedRoute>} />
            <Route path="/convener/resource-persons" element={<ProtectedRoute allowedRoles={['CONVENER', 'ADMIN']}><ResourcePersons /></ProtectedRoute>} />
            <Route path="/convener/expenses" element={<ProtectedRoute allowedRoles={['CONVENER', 'ADMIN']}><ExpensesLedger /></ProtectedRoute>} />
            <Route path="/convener/meetings" element={<ProtectedRoute allowedRoles={['CONVENER', 'ADMIN']}><ConvenerMeetings /></ProtectedRoute>} />
            <Route path="/convener/reports" element={<ProtectedRoute allowedRoles={['CONVENER', 'ADMIN']}><CloseEventReports /></ProtectedRoute>} />

<<<<<<< HEAD
            <Route path="/sanctioner" element={<ProtectedRoute allowedRoles={['SANCTIONER', 'ADMIN']}><ApprovalRequests /></ProtectedRoute>} />
=======
            <Route path="/sanctioner" element={<Navigate to="/sanctioner/dashboard" replace />} />
>>>>>>> ccb9f562e7b424c9b22862534d480c809f89c3d9
            <Route path="/sanctioner/dashboard" element={<ProtectedRoute allowedRoles={['SANCTIONER', 'ADMIN']}><ApprovalRequests /></ProtectedRoute>} />
            <Route path="/sanctioner/history" element={<ProtectedRoute allowedRoles={['SANCTIONER', 'ADMIN']}><ApprovalHistory /></ProtectedRoute>} />
            <Route path="/sanctioner/budget" element={<ProtectedRoute allowedRoles={['SANCTIONER', 'ADMIN']}><BudgetLedger /></ProtectedRoute>} />

            <Route path="/committee" element={<Navigate to="/committee/dashboard" replace />} />
            <Route path="/committee/dashboard" element={<ProtectedRoute allowedRoles={['COMMITTEE_MEMBER', 'ADMIN']}><MyTasks /></ProtectedRoute>} />
            <Route path="/committee/attendance" element={<ProtectedRoute allowedRoles={['COMMITTEE_MEMBER', 'ADMIN']}><Attendance /></ProtectedRoute>} />
            <Route path="/committee/meetings" element={<ProtectedRoute allowedRoles={['COMMITTEE_MEMBER', 'ADMIN']}><CommitteeMeetings /></ProtectedRoute>} />

<<<<<<< HEAD
            <Route path="/participant" element={<ProtectedRoute allowedRoles={['PARTICIPANT', 'ADMIN']}><BrowseEvents /></ProtectedRoute>} />
            <Route path="/participant/register" element={<ProtectedRoute allowedRoles={['PARTICIPANT', 'ADMIN']}><RegisterEvent /></ProtectedRoute>} />
=======
            <Route path="/participant" element={<Navigate to="/participant/dashboard" replace />} />
            <Route path="/participant/dashboard" element={<ProtectedRoute allowedRoles={['PARTICIPANT', 'ADMIN']}><BrowseEvents /></ProtectedRoute>} />
            <Route path="/participant/events" element={<Navigate to="/participant/dashboard" replace />} />
>>>>>>> ccb9f562e7b424c9b22862534d480c809f89c3d9
            <Route path="/participant/registrations" element={<ProtectedRoute allowedRoles={['PARTICIPANT', 'ADMIN']}><MyRegistrations /></ProtectedRoute>} />
            <Route path="/participant/feedback" element={<ProtectedRoute allowedRoles={['PARTICIPANT', 'ADMIN']}><FeedbackCertificate /></ProtectedRoute>} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
