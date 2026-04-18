import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

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

function CreateBookingPage() {
  const { resourceId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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

  // ---------- Validation Functions ----------
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

//validation

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
    if (name === "quantity" || name === "expectedAttendees") {
      newValue = value === "" ? "" : Number(value);
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Clear errors for affected fields
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "startDate" || name === "startTime") {
      if (errors.startDateTime) setErrors((prev) => ({ ...prev, startDateTime: "" }));
      // Re-validate end time when start changes
      if (formData.endDate && formData.endTime) {
        const endErr = validateEndDateTime(
          formData.endDate,
          formData.endTime,
          name === "startDate" ? newValue : formData.startDate,
          name === "startTime" ? newValue : formData.startTime
        );
        setErrors((prev) => ({ ...prev, endDateTime: endErr }));
      }
    }
    if (name === "endDate" || name === "endTime") {
      if (errors.endDateTime) setErrors((prev) => ({ ...prev, endDateTime: "" }));
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
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

    if (!validateForm()) {
      const firstError = document.querySelector(".error-border");
      if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);

    try {
      const startTime = combineDateTime(formData.startDate, formData.startTime);
      const endTime = combineDateTime(formData.endDate, formData.endTime);

      const payload = {
        resourceId: Number(resourceId),
        startTime,
        endTime,
        quantity: Number(formData.quantity),
        purpose: formData.purpose.trim(),
        expectedAttendees: Number(formData.expectedAttendees),
      };

      await api.post("/api/bookings?userId=1", payload);

      setMessage("Booking created successfully!");
      setMessageType("success");

      setTimeout(() => {
        navigate("/my-bookings");
      }, 1000);
    } catch (error) {
      console.error("Booking creation failed:", error);
      if (error?.response?.data?.fields) {
        const fieldErrors = Object.values(error.response.data.fields).join(", ");
        setMessage(fieldErrors);
      } else {
        setMessage(error?.response?.data?.message || "Failed to create booking.");
      }
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClass = (fieldName) => {
    const hasError = touched[fieldName] && errors[fieldName];
    return `w-full border-2 rounded-xl px-4 py-3 transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      hasError
        ? "border-red-400 bg-red-50"
        : "border-gray-200 hover:border-blue-300 bg-white"
    }`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Create New Booking</h1>
          <p className="mt-2 text-gray-600">Select date, time, and details for your reservation</p>
          <div className="mt-3 inline-flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full text-sm text-blue-700">
            <span className="font-medium">Resource ID:</span>
            <span className="font-mono font-bold">{resourceId}</span>
          </div>
        </div>

        {/* Message Toast */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl shadow-md ${
              messageType === "success"
                ? "bg-green-50 border-l-4 border-green-500 text-green-800"
                : "bg-red-50 border-l-4 border-red-500 text-red-800"
            }`}
          >
            <div className="flex items-center gap-3">
              {messageType === "success" ? (
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <p className="font-medium">{message}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Start Date & Time */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Start Date & Time
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <p className="mt-2 text-sm text-red-600">{errors.startDateTime}</p>
              )}
            </div>

            {/* End Date & Time */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  End Date & Time
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <p className="mt-2 text-sm text-red-600">{errors.endDateTime}</p>
              )}
            </div>

            {/* Quantity & Attendees */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  onBlur={() => handleBlur("quantity")}
                  min="1"
                  max="50"
                  className={getInputClass("quantity")}
                />
                {touched.quantity && errors.quantity && (
                  <p className="mt-2 text-sm text-red-600">{errors.quantity}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Max 50 units</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Expected Attendees</label>
                <input
                  type="number"
                  name="expectedAttendees"
                  value={formData.expectedAttendees}
                  onChange={handleChange}
                  onBlur={() => handleBlur("expectedAttendees")}
                  min="1"
                  max="200"
                  className={getInputClass("expectedAttendees")}
                />
                {touched.expectedAttendees && errors.expectedAttendees && (
                  <p className="mt-2 text-sm text-red-600">{errors.expectedAttendees}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Max 200 people</p>
              </div>
            </div>

            {/* Purpose */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Purpose</label>
              <input
                type="text"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                onBlur={() => handleBlur("purpose")}
                placeholder="e.g., Team Meeting, Workshop, Client Presentation"
                className={getInputClass("purpose")}
              />
              {touched.purpose && errors.purpose && (
                <p className="mt-2 text-sm text-red-600">{errors.purpose}</p>
              )}
              <div className="mt-1 flex justify-end">
                <span className={`text-xs ${formData.purpose.length > 180 ? "text-orange-500" : "text-gray-400"}`}>
                  {formData.purpose.length}/200
                </span>
              </div>
            </div>

            {/* Terms */}
            <div className="mb-8 pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={confirmTerms}
                  onChange={handleChange}
                  className="mt-0.5 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  I confirm that all booking details are accurate and I agree to the{" "}
                  <span className="text-blue-600 font-medium">cancellation policy</span>.
                </span>
              </label>
              {touched.terms && errors.terms && (
                <p className="mt-2 text-sm text-red-600 ml-8">{errors.terms}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2 shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Confirm Booking
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
            <span>📅 All times in your local timezone</span>
            
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateBookingPage;