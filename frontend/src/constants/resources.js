/** Mirrors com.smartcampus.entity.Resource.ResourceType (STRING enum in JSON) */
export const RESOURCE_TYPES = [
  { value: 'LECTURE_HALL', label: 'Lecture hall' },
  { value: 'LAB', label: 'Lab' },
  { value: 'MEETING_ROOM', label: 'Meeting room' },
  { value: 'PROJECTOR', label: 'Projector' },
  { value: 'CAMERA', label: 'Camera' },
  { value: 'LAPTOP', label: 'Laptop' },
  { value: 'OTHER', label: 'Other' },
];

/** Mirrors com.smartcampus.entity.Resource.ResourceStatus */
export const RESOURCE_STATUSES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'OUT_OF_SERVICE', label: 'Out of service' },
  { value: 'UNDER_REVIEW', label: 'Under review' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
];

export const DEFAULT_USER_ID = 1;
