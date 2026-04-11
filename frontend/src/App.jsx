import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Login from './pages/login';
import ResourcesPage from './pages/user/ResourcesPage';
import ResourceDetailPage from './pages/user/ResourceDetailPage';
import BookResourcePage from './pages/user/BookResourcePage';
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/resources/:id" element={<ResourceDetailPage />} />
          <Route path="/resources/:id/book" element={<BookResourcePage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
