import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [cancelingId, setCancelingId] = useState(null);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/bookings/my?userId=1");
      setBookings(response.data || []);
    } catch (error) {
      console.error("Failed to load my bookings", error);
      setMessage("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "-";

    const date = new Date(dateTime);
    return date.toLocaleString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRemainingTime = (minutes, overdue, status) => {
    if (status === "CANCELLED") return "Cancelled";
    if (status === "COMPLETED") return "Completed";
    if (overdue) return "Overdue";
    if (minutes <= 0) return "Due now";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m remaining`;
    }

    return `${mins}m remaining`;
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      setCancelingId(bookingId);
      await api.patch(`/api/bookings/${bookingId}/cancel?userId=1`, {
        note: "Cancelled by user",
      });

      setMessage("Booking cancelled successfully");
      fetchMyBookings();
    } catch (error) {
      console.error("Cancel failed", error);
      setMessage(error?.response?.data?.message || "Cancel failed");
    } finally {
      setCancelingId(null);
    }
  };

  const getStatusStyle = (booking) => {
    if (booking.status === "CANCELLED") {
      return "bg-gray-100 text-gray-700 border border-gray-200";
    }
    if (booking.status === "COMPLETED") {
      return "bg-blue-100 text-blue-700 border border-blue-200";
    }
    if (booking.overdue) {
      return "bg-red-100 text-red-700 border border-red-200";
    }
    if (booking.status === "APPROVED") {
      return "bg-green-100 text-green-700 border border-green-200";
    }
    if (booking.status === "PENDING") {
      return "bg-yellow-100 text-yellow-700 border border-yellow-200";
    }
    return "bg-gray-100 text-gray-700 border border-gray-200";
  };

  const getCountdownStyle = (booking) => {
    if (booking.status === "CANCELLED") return "text-gray-500";
    if (booking.status === "COMPLETED") return "text-blue-600";
    if (booking.overdue) return "text-red-600";
    if (booking.status === "APPROVED") return "text-green-600";
    if (booking.status === "PENDING") return "text-yellow-600";
    return "text-gray-600";
  };

  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === "PENDING").length;
    const approved = bookings.filter((b) => b.status === "APPROVED").length;
    const completed = bookings.filter((b) => b.status === "COMPLETED").length;
    const cancelled = bookings.filter((b) => b.status === "CANCELLED").length;

    return { total, pending, approved, completed, cancelled };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesFilter =
        activeFilter === "ALL" ? true : booking.status === activeFilter;

      const search = searchTerm.toLowerCase();
      const matchesSearch =
        booking.resourceName?.toLowerCase().includes(search) ||
        booking.resourceType?.toLowerCase().includes(search) ||
        booking.location?.toLowerCase().includes(search) ||
        booking.purpose?.toLowerCase().includes(search);

      return matchesFilter && matchesSearch;
    });
  }, [bookings, activeFilter, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-64 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="h-24 bg-white rounded-2xl shadow-sm"></div>
              ))}
            </div>
            <div className="h-14 bg-white rounded-2xl shadow-sm"></div>
            <div className="grid gap-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-52 bg-white rounded-2xl shadow-sm"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-500 mt-1">
              Manage, track, and review all your resource bookings
            </p>
          </div>

          <button
            onClick={fetchMyBookings}
            className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition"
          >
            Refresh
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm">
            {message}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">Total</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</h3>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">Pending</p>
            <h3 className="text-2xl font-bold text-yellow-600 mt-2">{stats.pending}</h3>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">Approved</p>
            <h3 className="text-2xl font-bold text-green-600 mt-2">{stats.approved}</h3>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">Completed</p>
            <h3 className="text-2xl font-bold text-blue-600 mt-2">{stats.completed}</h3>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500">Cancelled</p>
            <h3 className="text-2xl font-bold text-gray-600 mt-2">{stats.cancelled}</h3>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="w-full lg:max-w-md">
              <input
                type="text"
                placeholder="Search by resource, type, location, or purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {["ALL", "PENDING", "APPROVED", "COMPLETED", "CANCELLED"].map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    activeFilter === status
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Booking List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
            <h3 className="text-xl font-semibold text-gray-800">No bookings found</h3>
            <p className="text-gray-500 mt-2">
              Try changing the search text or filter option
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Left */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h2 className="text-xl font-bold text-gray-900">
                        {booking.resourceName}
                      </h2>

                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                          booking
                        )}`}
                      >
                        {booking.overdue && booking.status !== "CANCELLED" && booking.status !== "COMPLETED"
                          ? "Overdue"
                          : booking.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-sm">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-gray-500 mb-1">Resource Type</p>
                        <p className="font-semibold text-gray-800">{booking.resourceType}</p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-gray-500 mb-1">Location</p>
                        <p className="font-semibold text-gray-800">{booking.location}</p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-gray-500 mb-1">Purpose</p>
                        <p className="font-semibold text-gray-800">{booking.purpose || "-"}</p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-gray-500 mb-1">Start Time</p>
                        <p className="font-semibold text-gray-800">
                          {formatDateTime(booking.startTime)}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-gray-500 mb-1">End Time</p>
                        <p className="font-semibold text-gray-800">
                          {formatDateTime(booking.endTime)}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-gray-500 mb-1">Return Status</p>
                        <p className={`font-semibold ${getCountdownStyle(booking)}`}>
                          {formatRemainingTime(
                            booking.remainingMinutes,
                            booking.overdue,
                            booking.status
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="w-full lg:w-auto lg:min-w-[220px] flex flex-col gap-3">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-500 mb-1">Booking ID</p>
                      <p className="font-semibold text-gray-800">#{booking.id}</p>
                    </div>

                    {(booking.status === "PENDING" || booking.status === "APPROVED") && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancelingId === booking.id}
                        className="w-full px-4 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition"
                      >
                        {cancelingId === booking.id ? "Cancelling..." : "Cancel Booking"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookingsPage;