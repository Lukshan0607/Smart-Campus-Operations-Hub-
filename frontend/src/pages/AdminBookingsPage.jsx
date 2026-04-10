import { useEffect, useState } from "react";
import api from "../services/api";

function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchBookings = async () => {
    try {
      const response = await api.get("/api/admin/bookings");
      setBookings(response.data.content || []);
    } catch (error) {
      console.error("Failed to load admin bookings", error);
      setMessage("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const approveBooking = async (id) => {
    try {
      await api.patch(`/api/admin/bookings/${id}/approve?adminId=100`, {
        note: "Approved by admin",
      });
      setMessage("Booking approved successfully");
      fetchBookings();
    } catch (error) {
      console.error(error);
      setMessage(error?.response?.data?.message || "Approve failed");
    }
  };

  const rejectBooking = async (id) => {
    try {
      await api.patch(`/api/admin/bookings/${id}/reject?adminId=100`, {
        note: "Rejected by admin",
      });
      setMessage("Booking rejected successfully");
      fetchBookings();
    } catch (error) {
      console.error(error);
      setMessage(error?.response?.data?.message || "Reject failed");
    }
  };

  if (loading) {
    return <div className="p-6">Loading admin bookings...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Bookings</h1>

      {message && (
        <div className="mb-4 p-3 rounded bg-gray-100 text-sm">{message}</div>
      )}

      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="border rounded-lg p-4 shadow-sm bg-white"
            >
              <h2 className="text-xl font-semibold">{booking.resourceName}</h2>
              <p><strong>User ID:</strong> {booking.userId}</p>
              <p><strong>Purpose:</strong> {booking.purpose}</p>
              <p><strong>Start:</strong> {booking.startTime}</p>
              <p><strong>End:</strong> {booking.endTime}</p>
              <p><strong>Status:</strong> {booking.status}</p>

              {booking.status === "PENDING" && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => approveBooking(booking.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => rejectBooking(booking.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminBookingsPage;