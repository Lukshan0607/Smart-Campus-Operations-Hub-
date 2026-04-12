import { Navigate, Route, Routes } from 'react-router-dom';
import Home from "./pages/Home";
import Login from "./pages/login";
import TicketsPage from "./pages/ticketing/TicketsPage";
import TicketDetailPage from "./pages/ticketing/TicketDetailPage";
import CreateTicketPage from "./pages/ticketing/CreateTicketPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      {/* Module C - Maintenance & Incident Ticketing */}
      <Route path="/tickets" element={<TicketsPage />} />
      <Route path="/tickets/create" element={<CreateTicketPage />} />
      <Route path="/tickets/:id" element={<TicketDetailPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;