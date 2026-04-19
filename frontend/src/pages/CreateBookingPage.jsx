import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { getUser } from "../utils/auth";

// Helper: Get current date in YYYY-MM-DD
const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split("T")[0];
};

// Helper: Get current time in HH:MM
const getCurrentTime = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Combine date and time into ISO string for API
const combineDateTime = (date, time) => {
  if (!date || !time) return "";
  return `${date}T${time}:00`;
};

// Split ISO datetime into date + time
const splitDateTime = (isoString) => {
  if (!isoString) {
    return { date: getCurrentDate(), time: getCurrentTime() };
  }

  const dateObj = new Date(isoString);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  };
};

function CreateBookingPage() {
  const { resourceId, bookingId } = useParams();
  const navigate = useNavigate();

  const isEditMode = !!bookingId;

  const [formData, setFormData] = useState({
    resourceId: resourceId || "",
    startDate: getCurrentDate(),
    startTime: getCurrentTime(),
    endDate: getCurrentDate(),
    endTime: getCurrentTime(),
    quantity: 1,
    purpose: "",
    expectedAttendees: 1,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmTerms, setConfirmTerms] = useState(false);
  const [loadingBooking, setLoadingBooking] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchBookingForEdit();
    }
  }, [bookingId]);

  const fetchBookingForEdit = async () => {
    try {
      setLoadingBooking(true);
      setMessage("");
      const user = getUser();
      const userId = user?.id || 1;

      const response = await api.get(`/api/bookings/${bookingId}?userId=${userId}`);
      const booking = response.data;

      if (booking.status !== "PENDING") {
        setMessage("Only pending bookings can be edited.");
        setMessageType("error");
        return;
      }

      const start = splitDateTime(booking.startTime);
      const end = splitDateTime(booking.endTime);

      setFormData({
        resourceId: booking.resourceId || "",
        startDate: start.date,
        startTime: start.time,
        endDate: end.date,
        endTime: end.time,
        quantity: booking.quantity || 1,
        purpose: booking.purpose || "",
        expectedAttendees: booking.expectedAttendees || 1,
      });

      setConfirmTerms(true);
    } catch (error) {
      console.error("Failed to load booking:", error);
      setMessage(error?.response?.data?.message || "Failed to load booking details.");
      setMessageType("error");
    } finally {
      setLoadingBooking(false);
    }
  };

  const validateStartDateTime = (startDate, startTime) => {
    if (!startDate) return "Start date is required.";
    if (!startTime) return "Start time is required.";
    const startDateTime = new Date(combineDateTime(startDate, startTime));
    const now = new Date();
    if (startDateTime < now) return "Start time cannot be in the past.";
    return "";
  };

  const validateEndDateTime = (endDate, endTime, startDate, startTime) => {
    if (!endDate) return "End date is required.";
    if (!endTime) return "End time is required.";
    if (!startDate || !startTime) return "Please select start date/time first.";

    const startDateTime = new Date(combineDateTime(startDate, startTime));
    const endDateTime = new Date(combineDateTime(endDate, endTime));

    if (endDateTime <= startDateTime) {
      return "End time must be after start time.";
    }
    return "";
  };

  const validateQuantity = (value) => {
    const num = Number(value);
    if (isNaN(num) || num < 1) return "Quantity must be at least 1.";
    if (!Number.isInteger(num)) return "Quantity must be a whole number.";
    if (num > 50) return "Quantity cannot exceed 50.";
    return "";
  };

  const validatePurpose = (value) => {
    if (!value.trim()) return "Purpose is required.";
    if (value.length > 200) return "Purpose cannot exceed 200 characters.";
    return "";
  };

  const validateAttendees = (value) => {
    const num = Number(value);
    if (isNaN(num) || num < 1) return "Expected attendees must be at least 1.";
    if (!Number.isInteger(num)) return "Attendees must be a whole number.";
    if (num > 200) return "Attendees cannot exceed 200.";
    return "";
  };

  const validateForm = () => {
    const newErrors = {};

    const startError = validateStartDateTime(formData.startDate, formData.startTime);
    if (startError) newErrors.startDateTime = startError;

    const endError = validateEndDateTime(
      formData.endDate,
      formData.endTime,
      formData.startDate,
      formData.startTime
    );
    if (endError) newErrors.endDateTime = endError;

    const quantityError = validateQuantity(formData.quantity);
    if (quantityError) newErrors.quantity = quantityError;

    const purposeError = validatePurpose(formData.purpose);
    if (purposeError) newErrors.purpose = purposeError;

    const attendeesError = validateAttendees(formData.expectedAttendees);
    if (attendeesError) newErrors.expectedAttendees = attendeesError;

    if (!confirmTerms) newErrors.terms = "You must confirm the booking details.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let error = "";

    switch (field) {
      case "startDateTime":
        error = validateStartDateTime(formData.startDate, formData.startTime);
        break;
      case "endDateTime":
        error = validateEndDateTime(
          formData.endDate,
          formData.endTime,
          formData.startDate,
          formData.startTime
        );
        break;
      case "quantity":
        error = validateQuantity(formData.quantity);
        break;
      case "purpose":
        error = validatePurpose(formData.purpose);
        break;
      case "expectedAttendees":
        error = validateAttendees(formData.expectedAttendees);
        break;
      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setConfirmTerms(checked);
      if (checked && errors.terms) {
        setErrors((prev) => ({ ...prev, terms: "" }));
      }
      return;
    }

    let newValue = value;
    if (name === "quantity" || name === "expectedAttendees" || name === "resourceId") {
      newValue = value === "" ? "" : Number(value);
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "startDate" || name === "startTime") {
      if (errors.startDateTime) setErrors((prev) => ({ ...prev, startDateTime: "" }));

      const nextStartDate = name === "startDate" ? newValue : formData.startDate;
      const nextStartTime = name === "startTime" ? newValue : formData.startTime;

      if (formData.endDate && formData.endTime) {
        const endErr = validateEndDateTime(
          formData.endDate,
          formData.endTime,
          nextStartDate,
          nextStartTime
        );
        setErrors((prev) => ({ ...prev, endDateTime: endErr }));
      }
    }

    if (name === "endDate" || name === "endTime") {
      if (errors.endDateTime) setErrors((prev) => ({ ...prev, endDateTime: "" }));
    }
  };

  const handleCancel = () => {
    navigate(isEditMode ? "/my-bookings" : -1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    const allTouched = {
      startDateTime: true,
      endDateTime: true,
      quantity: true,
      purpose: true,
      expectedAttendees: true,
      terms: true,
    };
    setTouched(allTouched);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const startTime = combineDateTime(formData.startDate, formData.startTime);
      const endTime = combineDateTime(formData.endDate, formData.endTime);
      const user = getUser();
      const userId = user?.id || 1;

      const payload = {
        resourceId: Number(formData.resourceId),
        startTime,
        endTime,
        quantity: Number(formData.quantity),
        purpose: formData.purpose.trim(),
        expectedAttendees: Number(formData.expectedAttendees),
      };

      if (isEditMode) {
        await api.put(`/api/bookings/${bookingId}?userId=${userId}`, payload);
        setMessage("Booking updated successfully!");
      } else {
        await api.post(`/api/bookings?userId=${userId}`, payload);
        setMessage("Booking created successfully!");
      }

      setMessageType("success");

      setTimeout(() => {
        navigate("/my-bookings");
      }, 1000);
    } catch (error) {
      console.error(isEditMode ? "Booking update failed:" : "Booking creation failed:", error);
      setMessage(
        error?.response?.data?.message ||
          (isEditMode ? "Failed to update booking." : "Failed to create booking.")
      );
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClass = (fieldName) => {
    const hasError = touched[fieldName] && errors[fieldName];
    return `w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
      hasError ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-gray-400"
    }`;
  };

  if (loadingBooking) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-lg">
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl shadow-sm ${
              messageType === "success"
                ? "bg-green-50 border-l-4 border-green-500 text-green-800"
                : "bg-red-50 border-l-4 border-red-500 text-red-800"
            }`}
          >
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? "Edit Booking" : "Create Booking"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isEditMode
                ? "Update your pending booking details"
                : "Fill in the details to request a booking"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Resource ID</label>
              <input
                type="number"
                name="resourceId"
                value={formData.resourceId}
                onChange={handleChange}
                className={getInputClass("resourceId")}
                disabled={!isEditMode && !!resourceId}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Start Date & Time</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  onBlur={() => handleBlur("startDateTime")}
                  min={getCurrentDate()}
                  className={getInputClass("startDateTime")}
                />
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  onBlur={() => handleBlur("startDateTime")}
                  className={getInputClass("startDateTime")}
                />
              </div>
              {touched.startDateTime && errors.startDateTime && (
                <p className="mt-1.5 text-xs text-red-600">{errors.startDateTime}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">End Date & Time</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  onBlur={() => handleBlur("endDateTime")}
                  min={formData.startDate || getCurrentDate()}
                  className={getInputClass("endDateTime")}
                />
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  onBlur={() => handleBlur("endDateTime")}
                  className={getInputClass("endDateTime")}
                />
              </div>
              {touched.endDateTime && errors.endDateTime && (
                <p className="mt-1.5 text-xs text-red-600">{errors.endDateTime}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  onBlur={() => handleBlur("quantity")}
                  className={getInputClass("quantity")}
                />
                {touched.quantity && errors.quantity && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.quantity}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Attendees</label>
                <input
                  type="number"
                  name="expectedAttendees"
                  value={formData.expectedAttendees}
                  onChange={handleChange}
                  onBlur={() => handleBlur("expectedAttendees")}
                  className={getInputClass("expectedAttendees")}
                />
                {touched.expectedAttendees && errors.expectedAttendees && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.expectedAttendees}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Purpose</label>
              <input
                type="text"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                onBlur={() => handleBlur("purpose")}
                placeholder="e.g. Team Meeting"
                className={getInputClass("purpose")}
              />
              {touched.purpose && errors.purpose && (
                <p className="mt-1.5 text-xs text-red-600">{errors.purpose}</p>
              )}
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={confirmTerms}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">
                I confirm these details are accurate and agree to the{" "}
                <span className="text-blue-600 font-medium">cancellation policy</span>.
              </span>
            </div>
            {touched.terms && errors.terms && (
              <p className="text-xs text-red-600">{errors.terms}</p>
            )}

            <div className="pt-4 flex flex-col gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubmitting
                  ? (isEditMode ? "Updating..." : "Processing...")
                  : (isEditMode ? "Update Booking" : "Confirm Booking")}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateBookingPage;