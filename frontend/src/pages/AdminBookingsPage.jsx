import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const [actionLoading, setActionLoading] = useState({});
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectReasonError, setRejectReasonError] = useState("");

  //fetchBooking

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setMessage("");
      const response = await api.get("/api/admin/bookings");
      setBookings(response.data?.content || []);
    } catch (error) {
      console.error("Failed to load admin bookings", error);
      setMessage(error?.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const setRowLoading = (id, value) => {
    setActionLoading((prev) => ({
      ...prev,
      [id]: value,
    }));
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

  const getStatusBadgeClass = (booking) => {
    if (booking.status === "CANCELLED") {
      return "bg-gray-100 text-gray-700 border border-gray-200";
    }
    if (booking.status === "COMPLETED") {
      return "bg-blue-100 text-blue-700 border border-blue-200";
    }
    if (booking.status === "APPROVED") {
      return "bg-green-100 text-green-700 border border-green-200";
    }
    if (booking.status === "REJECTED") {
      return "bg-red-100 text-red-700 border border-red-200";
    }
    if (booking.status === "PENDING") {
      return "bg-yellow-100 text-yellow-700 border border-yellow-200";
    }
    return "bg-gray-100 text-gray-700 border border-gray-200";
  };

  const approveBooking = async (id) => {
    try {
      setRowLoading(id, true);
      setMessage("");

      await api.patch(`/api/admin/bookings/${id}/approve?adminId=100`, {
        note: "Approved by admin",
      });

      setMessage("Booking approved successfully");
      await fetchBookings();
    } catch (error) {
      console.error(error);
      setMessage(error?.response?.data?.message || "Approve failed");
    } finally {
      setRowLoading(id, false);
    }
  };

  const completeBooking = async (id) => {
    try {
      setRowLoading(id, true);
      setMessage("");

      await api.patch(`/api/admin/bookings/${id}/complete?adminId=100`, {
        note: "Completed by admin",
      });

      setMessage("Booking marked as completed");
      await fetchBookings();
    } catch (error) {
      console.error(error);
      setMessage(error?.response?.data?.message || "Complete failed");
    } finally {
      setRowLoading(id, false);
    }
  };

  const openRejectModal = (booking) => {
    setSelectedBooking(booking);
    setRejectReason("");
    setRejectReasonError("");
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setRejectModalOpen(false);
    setSelectedBooking(null);
    setRejectReason("");
    setRejectReasonError("");
  };

  const submitRejectBooking = async () => {
    if (!selectedBooking) return;

    const trimmedReason = rejectReason.trim();

    if (!trimmedReason) {
      setRejectReasonError("Reject reason is required");
      return;
    }

    try {
      setRowLoading(selectedBooking.id, true);
      setMessage("");

      await api.patch(
        `/api/admin/bookings/${selectedBooking.id}/reject?adminId=100`,
        {
          note: trimmedReason,
        }
      );

      setMessage("Booking rejected successfully");
      closeRejectModal();
      await fetchBookings();
    } catch (error) {
      console.error(error);
      setMessage(error?.response?.data?.message || "Reject failed");
    } finally {
      if (selectedBooking?.id) {
        setRowLoading(selectedBooking.id, false);
      }
    }
  };

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "PENDING").length,
      approved: bookings.filter((b) => b.status === "APPROVED").length,
      completed: bookings.filter((b) => b.status === "COMPLETED").length,
      rejected: bookings.filter((b) => b.status === "REJECTED").length,
      cancelled: bookings.filter((b) => b.status === "CANCELLED").length,
    };
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
        String(booking.id).includes(search) ||
        String(booking.userId).includes(search);

      return matchesFilter && matchesSearch;
    });
  }, [bookings, activeFilter, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto animate-pulse space-y-6">
          <div className="h-10 w-72 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-24 bg-white rounded-2xl shadow-sm"></div>
            ))}
          </div>
          <div className="h-16 bg-white rounded-2xl shadow-sm"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-64 bg-white rounded-2xl shadow-sm"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Bookings</h1>
            <p className="text-gray-500 mt-1">
              Review, approve, reject, and complete booking requests
            </p>
          </div>

          <button
            onClick={fetchBookings}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4 mb-8">
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
            <p className="text-sm text-gray-500">Rejected</p>
            <h3 className="text-2xl font-bold text-red-600 mt-2">{stats.rejected}</h3>
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
                placeholder="Search by booking ID, user ID, resource, type, location, or purpose..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {["ALL", "PENDING", "APPROVED", "REJECTED", "COMPLETED", "CANCELLED"].map(
                (status) => (
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
                )
              )}
            </div>
          </div>
        </div>

        {/* Booking cards */}
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
              const rowBusy = !!actionLoading[booking.id];

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
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                              booking
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </div>

                        <p className="text-sm text-gray-500">
                          Booking ID: #{booking.id}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {booking.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => approveBooking(booking.id)}
                              disabled={rowBusy}
                              className="px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition"
                            >
                              {rowBusy ? "Processing..." : "Approve"}
                            </button>

                            <button
                              onClick={() => openRejectModal(booking)}
                              disabled={rowBusy}
                              className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {booking.status === "APPROVED" && (
                          <button
                            onClick={() => completeBooking(booking.id)}
                            disabled={rowBusy}
                            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
                          >
                            {rowBusy ? "Processing..." : "Mark Complete"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Booking Details
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-sm">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-gray-500 mb-1">User ID</p>
                          <p className="font-semibold text-gray-800">{booking.userId ?? "-"}</p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-gray-500 mb-1">Resource Type</p>
                          <p className="font-semibold text-gray-800">
                            {booking.resourceType || "-"}
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-gray-500 mb-1">Location</p>
                          <p className="font-semibold text-gray-800">
                            {booking.location || "-"}
                          </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-gray-500 mb-1">Purpose</p>
                          <p className="font-semibold text-gray-800">
                            {booking.purpose || "-"}
                          </p>
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
                          <p className="text-gray-500 mb-1">Quantity</p>
                          <p className="font-semibold text-gray-800">
                            {booking.quantity ?? "-"}
                          </p>
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
                          <p className="text-gray-500 mb-1">Rejection Reason</p>
                          <p className="font-semibold text-gray-800">
                            {booking.rejectionReason || "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900">Reject Booking</h2>
              <p className="mt-1 text-sm text-gray-500">
                Enter a clear reason for rejecting this booking request.
              </p>
            </div>

            <div className="px-6 py-5">
              <div className="mb-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">Booking ID:</span>{" "}
                  #{selectedBooking?.id}
                </p>
                <p className="mt-1">
                  <span className="font-semibold">Resource:</span>{" "}
                  {selectedBooking?.resourceName || "-"}
                </p>
                <p className="mt-1">
                  <span className="font-semibold">User ID:</span>{" "}
                  {selectedBooking?.userId ?? "-"}
                </p>
              </div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reject Reason
              </label>

              <textarea
                rows={5}
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  if (e.target.value.trim()) {
                    setRejectReasonError("");
                  }
                }}
                placeholder="Example: Resource is unavailable during the requested time slot."
                className={`w-full rounded-xl border px-4 py-3 outline-none resize-none focus:ring-2 ${
                  rejectReasonError
                    ? "border-red-400 bg-red-50 focus:ring-red-200"
                    : "border-gray-200 bg-white focus:ring-gray-900/10"
                }`}
              />

              {rejectReasonError && (
                <p className="mt-2 text-sm text-red-600">{rejectReasonError}</p>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end border-t border-gray-100 px-6 py-4">
              <button
                onClick={closeRejectModal}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
              >
                Cancel
              </button>

              <button
                onClick={submitRejectBooking}
                className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBookingsPage;