import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";

function MyBookingsPage() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [histories, setHistories] = useState({});
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);
  const [historyLoadingId, setHistoryLoadingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [cancelingId, setCancelingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    fetchMyBookings();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      setMessage("");
      const response = await api.get("/api/bookings/my?userId=1");
      setBookings(response.data || []);
    } catch (error) {
      console.error("Failed to load my bookings", error);
      setMessage(error?.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingHistory = async (bookingId) => {
    try {
      setHistoryLoadingId(bookingId);
      const response = await api.get(`/api/bookings/${bookingId}/history?userId=1`);
      setHistories((prev) => ({
        ...prev,
        [bookingId]: response.data || [],
      }));
    } catch (error) {
      console.error("Failed to load booking history", error);
      setMessage(error?.response?.data?.message || "Failed to load booking history");
    } finally {
      setHistoryLoadingId(null);
    }
  };

  const handleToggleHistory = async (bookingId) => {
    if (expandedHistoryId === bookingId) {
      setExpandedHistoryId(null);
      return;
    }

    setExpandedHistoryId(bookingId);

    if (!histories[bookingId]) {
      await fetchBookingHistory(bookingId);
    }
  };

  const handleEditBooking = (bookingId) => {
    navigate(`/bookings/${bookingId}/edit`);
  };

  const handleDeleteBooking = async (bookingId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this booking?");
    if (!confirmDelete) return;

    try {
      setDeletingId(bookingId);
      setMessage("");

      await api.delete(`/api/bookings/${bookingId}?userId=1`);

      setMessage("Booking deleted successfully");
      await fetchMyBookings();

      if (expandedHistoryId === bookingId) {
        await fetchBookingHistory(bookingId);
      }
    } catch (error) {
      console.error("Delete failed", error);
      setMessage(error?.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      setCancelingId(bookingId);
      setMessage("");

      await api.patch(`/api/bookings/${bookingId}/cancel?userId=1`, {
        note: "Cancelled by user",
      });

      setMessage("Booking cancelled successfully");
      await fetchMyBookings();

      if (expandedHistoryId === bookingId) {
        await fetchBookingHistory(bookingId);
      }
    } catch (error) {
      console.error("Cancel failed", error);
      setMessage(error?.response?.data?.message || "Cancel failed");
    } finally {
      setCancelingId(null);
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "-";

    return new Date(dateTime).toLocaleString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatHistoryAction = (action) => {
    if (!action) return "-";
    return action.replaceAll("_", " ");
  };

  const getLiveRemainingTime = (booking) => {
    if (booking.status === "CANCELLED") return "Cancelled";
    if (booking.status === "COMPLETED") return "Completed";
    if (booking.status === "REJECTED") return "Rejected";

    const end = new Date(booking.endTime).getTime();
    const diffMs = end - now;
    const diffMinutes = Math.floor(diffMs / 60000);

    if (booking.overdue || diffMinutes < 0) {
      return "Overdue";
    }

    if (diffMinutes === 0) {
      return "Due now";
    }

    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;

    if (hours > 0) return `${hours}h ${mins}m remaining`;
    return `${mins}m remaining`;
  };

  const getStatusStyle = (booking) => {
    if (booking.status === "CANCELLED") {
      return "bg-gray-100 text-gray-700 border border-gray-200";
    }
    if (booking.status === "COMPLETED") {
      return "bg-blue-100 text-blue-700 border border-blue-200";
    }
    if (booking.status === "REJECTED") {
      return "bg-red-100 text-red-700 border border-red-200";
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
    if (booking.status === "REJECTED") return "text-red-600";
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

      const search = searchTerm.toLowerCase().trim();
      const matchesSearch =
        booking.resourceName?.toLowerCase().includes(search) ||
        booking.resourceType?.toLowerCase().includes(search) ||
        booking.location?.toLowerCase().includes(search) ||
        booking.purpose?.toLowerCase().includes(search) ||
        String(booking.id).includes(search);

      return matchesFilter && matchesSearch;
    });
  }, [bookings, activeFilter, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto p-6">
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
                <div key={item} className="h-64 bg-white rounded-2xl shadow-sm"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-500 mt-1">
              View current booking details and booking history separately
            </p>
          </div>

          <button
            onClick={fetchMyBookings}
            className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition"
          >
            Refresh
          </button>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm">
            {message}
          </div>
        )}

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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="w-full lg:max-w-md">
              <input
                type="text"
                placeholder="Search by booking ID, resource, type, location, or purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {["ALL", "PENDING", "APPROVED", "COMPLETED", "CANCELLED", "REJECTED"].map((status) => (
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

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
            <h3 className="text-xl font-semibold text-gray-800">No bookings found</h3>
            <p className="text-gray-500 mt-2">
              Try changing the search text or filter option
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredBookings.map((booking) => {
              const bookingHistory = histories[booking.id] || [];
              const isHistoryOpen = expandedHistoryId === booking.id;
              const isPending = booking.status === "PENDING";

              return (
                <div
                  key={booking.id}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition p-6"
                >
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h2 className="text-xl font-bold text-gray-900">
                            {booking.resourceName || "Unnamed Resource"}
                          </h2>

                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                              booking
                            )}`}
                          >
                            {booking.overdue &&
                            booking.status !== "CANCELLED" &&
                            booking.status !== "COMPLETED" &&
                            booking.status !== "REJECTED"
                              ? "OVERDUE"
                              : booking.status}
                          </span>
                        </div>

                        <p className="text-sm text-gray-500">
                          Booking ID: #{booking.id}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleToggleHistory(booking.id)}
                          className="px-4 py-2 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
                        >
                          {isHistoryOpen ? "Hide History" : "View History"}
                        </button>

                        {isPending && (
                          <button
                            onClick={() => handleEditBooking(booking.id)}
                            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                          >
                            Edit Booking
                          </button>
                        )}

                        {isPending && (
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            disabled={deletingId === booking.id}
                            className="px-4 py-2 rounded-xl bg-red-700 text-white hover:bg-red-800 disabled:bg-red-300 disabled:cursor-not-allowed transition"
                          >
                            {deletingId === booking.id ? "Deleting..." : "Delete Booking"}
                          </button>
                        )}

                        {(booking.status === "PENDING" || booking.status === "APPROVED") && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancelingId === booking.id}
                            className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition"
                          >
                            {cancelingId === booking.id ? "Cancelling..." : "Cancel Booking"}
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Current Booking Details
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-sm">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-gray-500 mb-1">Resource Type</p>
                          <p className="font-semibold text-gray-800">{booking.resourceType || "-"}</p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-gray-500 mb-1">Location</p>
                          <p className="font-semibold text-gray-800">{booking.location || "-"}</p>
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
                          <p className="text-gray-500 mb-1">Remaining Time</p>
                          <p className={`font-semibold ${getCountdownStyle(booking)}`}>
                            {getLiveRemainingTime(booking)}
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-gray-500 mb-1">Quantity</p>
                          <p className="font-semibold text-gray-800">{booking.quantity ?? "-"}</p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-gray-500 mb-1">Expected Attendees</p>
                          <p className="font-semibold text-gray-800">
                            {booking.expectedAttendees ?? "-"}
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-gray-500 mb-1">Created At</p>
                          <p className="font-semibold text-gray-800">
                            {formatDateTime(booking.createdAt)}
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-gray-500 mb-1">Reviewed By</p>
                          <p className="font-semibold text-gray-800">
                            {booking.reviewedBy ?? "-"}
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-gray-500 mb-1">Reviewed At</p>
                          <p className="font-semibold text-gray-800">
                            {formatDateTime(booking.reviewedAt)}
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-gray-500 mb-1">Cancellation Reason</p>
                          <p className="font-semibold text-gray-800">
                            {booking.cancellationReason || "-"}
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-gray-500 mb-1">Rejection Reason</p>
                          <p className="font-semibold text-gray-800">
                            {booking.rejectionReason || "-"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {isHistoryOpen && (
                      <div className="border-t border-gray-100 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Booking History
                        </h3>

                        {historyLoadingId === booking.id ? (
                          <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                            Loading booking history...
                          </div>
                        ) : bookingHistory.length === 0 ? (
                          <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
                            No history available for this booking.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {bookingHistory.map((item) => (
                              <div
                                key={item.id}
                                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                              >
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                  <div>
                                    <p className="text-sm text-gray-500">Action</p>
                                    <p className="font-semibold text-gray-900">
                                      {formatHistoryAction(item.action)}
                                    </p>
                                  </div>

                                  <div className="text-sm text-gray-500">
                                    {formatDateTime(item.actionAt)}
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                                  <div>
                                    <p className="text-gray-500">Action By</p>
                                    <p className="font-medium text-gray-800">
                                      {item.actionBy ?? "-"}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-gray-500">Note</p>
                                    <p className="font-medium text-gray-800">
                                      {item.note || "-"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default MyBookingsPage;