import { Navigate, Route, Routes } from 'react-router-dom';
import Home from "./pages/Home";
import Login from "./pages/login";
import Signup from "./pages/signup";
import OAuthSuccess from "./pages/oauth-success";
import TicketsPage from "./pages/ticketing/TicketsPage";
import TicketDetailPage from "./pages/ticketing/TicketDetailPage";
import CreateTicketPage from "./pages/ticketing/CreateTicketPage";
import ProtectedRoute from './components/auth/ProtectedRoute';
import { defaultDashboardPath } from './utils/auth';
import MyTicketsDashboard from './pages/dashboard/MyTicketsDashboard';
import TechnicianJobsDashboard from './pages/dashboard/TechnicianJobsDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import CategoryPriorityDetailsPage from './pages/dashboard/CategoryPriorityDetailsPage';
import AdminBottomDetailsPage from './pages/dashboard/AdminBottomDetailsPage';
import AssignTechniciansPage from './pages/dashboard/AssignTechniciansPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />
      
      <Route path="/dashboard" element={<Navigate to={defaultDashboardPath()} replace />} />

      <Route
        path="/my-tickets"
        element={
          <ProtectedRoute roles={["STUDENT", "LECTURER", "ADMIN"]}>
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
        element={<AdminDashboard />}
      />

      <Route
        path="/admin/category-priority"
        element={<CategoryPriorityDetailsPage />}
      />

      <Route
        path="/admin/bottom-details"
        element={<AdminBottomDetailsPage />}
      />

      <Route
        path="/admin/assign-technicians"
        element={<AssignTechniciansPage />}
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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;