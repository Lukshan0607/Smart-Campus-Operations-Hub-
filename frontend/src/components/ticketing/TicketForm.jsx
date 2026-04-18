import React, { useEffect, useState } from 'react';
import { getCategoryOptions, getSubCategoryOptions } from '../../utils/ticketCategories';

const LOCATION_OPTIONS = [
  { value: 'MAIN_BUILDING', label: 'Main Building' },
  { value: 'ENGINEERING_BUILDING', label: 'Engineering Building' },
  { value: 'BUSINESS_MANAGEMENT_BUILDING', label: 'Business Management Building' },
  { value: 'OTHER', label: 'Other' },
];

const FLOOR_OPTIONS = Array.from({ length: 10 }, (_, index) => String(index + 1));
const BLOCK_OPTIONS = ['L', 'H'];

const getDefaultFormData = () => ({
  title: '',
  description: '',
  category: 'FACILITIES',
  subCategory: 'LIGHTING',
  priority: 'MEDIUM',
  locationCategory: 'MAIN_BUILDING',
  buildingName: 'Main Building',
  floorNumber: '1',
  block: 'L',
  roomNumber: '',
  otherLocation: '',
  contactPhone: '',
});

const isValidContactNumber = (value) => /^\d{10}$/.test(String(value || '').trim());

const TicketForm = ({ onSubmit, loading = false, initialData = null, submitLabel = 'Create Ticket' }) => {
  const [formData, setFormData] = useState(
    initialData || getDefaultFormData()
  );

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      const validCategory = getCategoryOptions().some((item) => item.value === initialData.category)
        ? initialData.category
        : 'FACILITIES';
      const initialCategory = validCategory;
      const currentSubCategories = getSubCategoryOptions(initialCategory);
      const fallbackSubCategory = currentSubCategories[0]?.value || 'GENERAL';
      const initialSubCategoryIsValid = currentSubCategories.some((item) => item.value === initialData.subCategory);
      setFormData({
        ...getDefaultFormData(),
        ...initialData,
        category: initialCategory,
        subCategory: initialSubCategoryIsValid ? initialData.subCategory : fallbackSubCategory,
        floorNumber: initialData.floorNumber != null ? String(initialData.floorNumber) : '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === 'contactPhone' ? value.replace(/\D/g, '').slice(0, 10) : value;
    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
      ...(name === 'category'
        ? { subCategory: getSubCategoryOptions(value)[0]?.value || '' }
        : {}),
      ...(name === 'locationCategory'
        ? { buildingName: LOCATION_OPTIONS.find((option) => option.value === value)?.label || value }
        : {}),
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    if (name === 'category' && errors.subCategory) {
      setErrors((prev) => ({
        ...prev,
        subCategory: '',
      }));
    }
    if (name === 'contactPhone' && errors.contactPhone) {
      setErrors((prev) => ({
        ...prev,
        contactPhone: '',
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
    if (!formData.subCategory) {
      newErrors.subCategory = 'Subcategory is required';
    }
    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
    }
    if (!formData.locationCategory) {
      newErrors.locationCategory = 'Building name is required';
    }
    if (formData.locationCategory === 'OTHER') {
      if (!formData.otherLocation.trim()) {
        newErrors.otherLocation = 'Please specify where the issue is located';
      }
    } else {
      if (!formData.floorNumber) {
        newErrors.floorNumber = 'Floor is required';
      }
      if (!formData.block) {
        newErrors.block = 'Block is required';
      }
      if (!formData.roomNumber.trim()) {
        newErrors.roomNumber = 'Room number is required';
      }
    }
    if (formData.contactPhone && !isValidContactNumber(formData.contactPhone)) {
      newErrors.contactPhone = 'Contact number must be exactly 10 digits';
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
            {getCategoryOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Subcategory</label>
          <select
            name="subCategory"
            value={formData.subCategory}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 ${
              errors.subCategory ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {getSubCategoryOptions(formData.category).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.subCategory && <p className="text-red-600 text-sm mt-1">{errors.subCategory}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Building Name</label>
          <select
            name="locationCategory"
            value={formData.locationCategory}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 ${
              errors.locationCategory ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            {LOCATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.locationCategory && (
            <p className="text-red-600 text-sm mt-1">{errors.locationCategory}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Floor</label>
          <select
            name="floorNumber"
            value={formData.floorNumber}
            onChange={handleChange}
            disabled={formData.locationCategory === 'OTHER'}
            className={`w-full border rounded-lg px-3 py-2 ${
              errors.floorNumber ? 'border-red-500' : 'border-gray-300'
            } ${formData.locationCategory === 'OTHER' ? 'bg-gray-100 text-gray-400' : ''}`}
          >
            <option value="">Select floor</option>
            {FLOOR_OPTIONS.map((floor) => (
              <option key={floor} value={floor}>
                {floor}
              </option>
            ))}
          </select>
          {errors.floorNumber && <p className="text-red-600 text-sm mt-1">{errors.floorNumber}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Block</label>
          <select
            name="block"
            value={formData.block}
            onChange={handleChange}
            disabled={formData.locationCategory === 'OTHER'}
            className={`w-full border rounded-lg px-3 py-2 ${
              errors.block ? 'border-red-500' : 'border-gray-300'
            } ${formData.locationCategory === 'OTHER' ? 'bg-gray-100 text-gray-400' : ''}`}
          >
            <option value="">Select block</option>
            {BLOCK_OPTIONS.map((block) => (
              <option key={block} value={block}>
                {block}
              </option>
            ))}
          </select>
          {errors.block && <p className="text-red-600 text-sm mt-1">{errors.block}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Room Number</label>
          <input
            type="text"
            name="roomNumber"
            value={formData.roomNumber}
            onChange={handleChange}
            disabled={formData.locationCategory === 'OTHER'}
            className={`w-full border rounded-lg px-3 py-2 ${
              errors.roomNumber ? 'border-red-500' : 'border-gray-300'
            } ${formData.locationCategory === 'OTHER' ? 'bg-gray-100 text-gray-400' : ''}`}
            placeholder="Room number"
          />
          {errors.roomNumber && <p className="text-red-600 text-sm mt-1">{errors.roomNumber}</p>}
        </div>
      </div>

      {formData.locationCategory === 'OTHER' && (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-900 mb-2">Where is it?</label>
          <input
            type="text"
            name="otherLocation"
            value={formData.otherLocation}
            onChange={handleChange}
            className={`w-full border rounded-lg px-3 py-2 ${
              errors.otherLocation ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter the exact location"
          />
          {errors.otherLocation && (
            <p className="text-red-600 text-sm mt-1">{errors.otherLocation}</p>
          )}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Location Summary</label>
        <input
          type="text"
          value={
            formData.locationCategory === 'OTHER'
              ? formData.otherLocation
              : `${formData.buildingName}, Floor ${formData.floorNumber}, Block ${formData.block}, Room ${formData.roomNumber}`
          }
          readOnly
          className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-600"
          placeholder="Location summary"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Contact Phone</label>
        <input
          type="tel"
          name="contactPhone"
          value={formData.contactPhone}
          onChange={handleChange}
          inputMode="numeric"
          maxLength={10}
          className={`w-full border rounded-lg px-3 py-2 ${
            errors.contactPhone ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter 10 digits"
        />
        {errors.contactPhone && <p className="text-red-600 text-sm mt-1">{errors.contactPhone}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
      >
        {loading ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
};

export default TicketForm;
