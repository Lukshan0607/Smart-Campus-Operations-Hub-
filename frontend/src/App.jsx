import { Navigate, Route, Routes } from 'react-router-dom';
import Home from "./pages/Home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import OAuthSuccess from "./pages/oauth-success";
import TicketsPage from "./pages/ticketing/TicketsPage";
import TicketDetailPage from "./pages/ticketing/TicketDetailPage";
import CreateTicketPage from "./pages/ticketing/CreateTicketPage";
import ResourcesPage from "./pages/ResourcesPage";
import ResourceDetailPage from "./pages/ResourceDetailPage";
import BookResourcePage from "./pages/BookResourcePage";
import ProtectedRoute from './components/auth/ProtectedRoute';
import { defaultDashboardPath } from './utils/auth';
import MyTicketsDashboard from './pages/dashboard/MyTicketsDashboard';
import TechnicianJobsDashboard from './pages/dashboard/TechnicianJobsDashboard';
import AdminTicket from './pages/dashboard/AdminTicket';
import AdminDashboardNew from './pages/dashboard/AdminDashboardNew';
import AdminUserManagement from './pages/dashboard/AdminUserManagement';
import CategoryPriorityDetailsPage from './pages/dashboard/CategoryPriorityDetailsPage';
import AdminBottomDetailsPage from './pages/dashboard/AdminBottomDetailsPage';
import AssignTechniciansPage from './pages/dashboard/AssignTechniciansPage';
import CreateBookingPage from "./pages/CreateBookingPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import AdminBookingsPage from "./pages/AdminBookingsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />
      <Route path="/admin/dashboard-new" element={<AdminDashboardNew />} />
      <Route path="/admin/user-management" element={<AdminUserManagement />} />
      <Route path="/dashboard" element={<Navigate to={defaultDashboardPath()} replace />} />
      <Route path="/book/:resourceId" element={<CreateBookingPage />} />
      <Route path="/my-bookings" element={<MyBookingsPage />} />
      <Route path="/admin/bookings" element={<AdminBookingsPage />} />
       <Route path="/resources" element={<ResourcesPage />} />



      <Route
        path="/my-tickets"
        element={
          <ProtectedRoute roles={["STUDENT", "LECTURER", "USER", "ADMIN"]}>
            <MyTicketsDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-jobs"
        element={
          <ProtectedRoute roles={["TECHNICIAN", "ADMIN"]}>
            <TechnicianJobsDashboard />
          </ProtectedRoute>
        }
      />

      

      <Route
        path="/admin/tickets"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminTicket />
          </ProtectedRoute>
        }
      />

      {/* <Route
        path="/admin/dashboard-new"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminDashboardNew />
          </ProtectedRoute>
        }
      /> */}

      {/* <Route
        path="/admin/user-management"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminUserManagement />
          </ProtectedRoute>
        }
      /> */}

      <Route
        path="/admin/category-priority"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <CategoryPriorityDetailsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/bottom-details"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminBottomDetailsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/assign-technicians"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AssignTechniciansPage />
          </ProtectedRoute>
        }
      />

      {/* Module C - Maintenance & Incident Ticketing */}
      <Route
        path="/tickets"
        element={
          <ProtectedRoute>
            <TicketsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets/create"
        element={
          <ProtectedRoute>
            <CreateTicketPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tickets/:id"
        element={
          <ProtectedRoute>
            <TicketDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Module A & B - Resources & Booking */}
      <Route
        path="/resources"
        element={
          <ProtectedRoute>
            <ResourcesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resources/:id"
        element={
          <ProtectedRoute>
            <ResourceDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/resources/:id/book"
        element={
          <ProtectedRoute>
            <BookResourcePage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;