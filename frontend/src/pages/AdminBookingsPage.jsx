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

  const renderStatusBadge = (booking) => {
    if (booking.status === "CANCELLED") {
      return (
        <span className="inline-block mt-2 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded">
          Cancelled
        </span>
      );
    }

    if (booking.status === "COMPLETED") {
      return (
        <span className="inline-block mt-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded">
          Completed
        </span>
      );
    }

    if (booking.status === "APPROVED") {
      return (
        <span className="inline-block mt-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded">
          Approved
        </span>
      );
    }

    if (booking.status === "REJECTED") {
      return (
        <span className="inline-block mt-2 px-3 py-1 text-sm bg-red-100 text-red-700 rounded">
          Rejected
        </span>
      );
    }

    if (booking.status === "PENDING") {
      return (
        <span className="inline-block mt-2 px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded">
          Pending
        </span>
      );
    }

    return (
      <span className="inline-block mt-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded">
        {booking.status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 text-black">
        Loading admin bookings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-black">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-black">Admin Bookings</h1>

        {message && (
          <div className="mb-4 p-3 rounded bg-white border text-sm text-black shadow-sm">
            {message}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-6 text-black">
            No bookings found.
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="border rounded-lg p-4 shadow-sm bg-white text-black"
              >
                <h2 className="text-xl font-semibold text-black">
                  {booking.resourceName}
                </h2>
                <p><strong>User ID:</strong> {booking.userId}</p>
                <p><strong>Type:</strong> {booking.resourceType}</p>
                <p><strong>Location:</strong> {booking.location}</p>
                <p><strong>Purpose:</strong> {booking.purpose}</p>
                <p><strong>Start:</strong> {booking.startTime}</p>
                <p><strong>End:</strong> {booking.endTime}</p>
                <p><strong>Status:</strong> {booking.status}</p>

                {renderStatusBadge(booking)}

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
    </div>
  );
}

export default AdminBookingsPage;