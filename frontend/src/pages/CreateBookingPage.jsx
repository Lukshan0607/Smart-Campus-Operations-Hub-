import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function CreateBookingPage() {
  const { resourceId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    startTime: "",
    endTime: "",
    quantity: 1,
    purpose: "",
    expectedAttendees: 1,
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        resourceId: Number(resourceId),
        startTime: formData.startTime,
        endTime: formData.endTime,
        quantity: Number(formData.quantity),
        purpose: formData.purpose,
        expectedAttendees: Number(formData.expectedAttendees),
      };

      await api.post("/api/bookings?userId=1", payload);
      setMessage("Booking created successfully!");
      setTimeout(() => navigate("/my-bookings"), 1000);
    } catch (error) {
      console.error(error);
      setMessage(
        error?.response?.data?.message || "Failed to create booking."
      );
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Booking</h1>

      {message && (
        <div className="mb-4 p-3 rounded bg-gray-100 text-sm">{message}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded shadow">
        <div>
          <label className="block mb-1 font-medium">Start Time</label>
          <input
            type="datetime-local"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">End Time</label>
          <input
            type="datetime-local"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            min="1"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Purpose</label>
          <input
            type="text"
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Expected Attendees</label>
          <input
            type="number"
            name="expectedAttendees"
            value={formData.expectedAttendees}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            min="1"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Submit Booking
        </button>
      </form>
    </div>
  );
}

export default CreateBookingPage;