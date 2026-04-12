import React, { useState } from 'react';

const TicketForm = ({ onSubmit, loading = false, initialData = null }) => {
  const [formData, setFormData] = useState(
    initialData || {
      title: '',
      description: '',
      category: 'MAINTENANCE',
      priority: 'MEDIUM',
      location: '',
      contactPhone: '',
    }
  );

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim() || formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }
    if (!formData.description.trim() || formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-md">
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full border rounded-lg px-3 py-2 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Brief title of the issue"
        />
        {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={`w-full border rounded-lg px-3 py-2 h-32 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Detailed description of the issue"
        />
        {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="MAINTENANCE">Maintenance</option>
            <option value="REPAIR">Repair</option>
            <option value="CLEANING">Cleaning</option>
            <option value="OTHER">Other</option>
          </select>
          {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 ${
              errors.priority ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
          {errors.priority && <p className="text-red-600 text-sm mt-1">{errors.priority}</p>}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Location</label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Building, Room, or Area"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Contact Phone</label>
        <input
          type="tel"
          name="contactPhone"
          value={formData.contactPhone}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="+1 (555) 000-0000"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
      >
        {loading ? 'Creating...' : 'Create Ticket'}
      </button>
    </form>
  );
};

export default TicketForm;
