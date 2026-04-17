import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import Login from './pages/login';
import ResourcesPage from './pages/user/ResourcesPage';
import ResourceDetailPage from './pages/user/ResourceDetailPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateBookingPage from './pages/CreateBookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminBookingsPage from './pages/AdminBookingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/resources/:id" element={<ResourceDetailPage />} />
          <Route path="/resources/:resourceId/book" element={<CreateBookingPage />} />
          <Route path="/book/:resourceId" element={<CreateBookingPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
        </Route>
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
