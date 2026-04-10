import { useEffect, useState } from "react";
import api from "../services/api";

function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyBookings = async () => {
    try {
      const response = await api.get("/api/bookings/my?userId=1");
      setBookings(response.data || []);
    } catch (error) {
      console.error("Failed to load my bookings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const formatRemainingTime = (minutes, overdue) => {
    if (overdue) return "Overdue";
    if (minutes <= 0) return "Due now";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m remaining`;
    }
    return `${mins}m remaining`;
  };

  if (loading) {
    return <div className="p-6">Loading my bookings...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Bookings</h1>

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
              <p><strong>Type:</strong> {booking.resourceType}</p>
              <p><strong>Location:</strong> {booking.location}</p>
              <p><strong>Purpose:</strong> {booking.purpose}</p>
              <p><strong>Start:</strong> {booking.startTime}</p>
              <p><strong>End:</strong> {booking.endTime}</p>
              <p><strong>Status:</strong> {booking.status}</p>
              <p>
                <strong>Return Time:</strong>{" "}
                {formatRemainingTime(booking.remainingMinutes, booking.overdue)}
              </p>

              {booking.overdue ? (
                <span className="inline-block mt-2 px-3 py-1 text-sm bg-red-100 text-red-700 rounded">
                  Overdue
                </span>
              ) : (
                <span className="inline-block mt-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded">
                  Active
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookingsPage;