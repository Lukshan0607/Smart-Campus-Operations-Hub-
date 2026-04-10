import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/login";
import ResourcesPage from "./pages/ResourcesPage";
import CreateBookingPage from "./pages/CreateBookingPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import AdminBookingsPage from "./pages/AdminBookingsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/book/:resourceId" element={<CreateBookingPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
        <Route path="/admin/bookings" element={<AdminBookingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;