export const formatCategoryDisplay = (category, subCategory) => {
  if (subCategory) {
    return `${category} - ${subCategory}`;
  }
  return category || 'N/A';
};

export const TICKET_CATEGORIES = [
  'ELECTRICAL',
  'FURNITURE',
  'NETWORK',
  'MAINTENANCE',
  'IT_SUPPORT',
  'AUDIO_VISUAL',
  'SECURITY',
  'PLUMBING',
  'HVAC',
  'CLEANING',
  'PEST_CONTROL',
  'LANDSCAPING',
];

export const TICKET_PRIORITIES = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT',
];

export const TICKET_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'RESOLVED',
  'CLOSED',
  'REJECTED',
  'COMPLETED',
];

export const STATUS_COLORS = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  REJECTED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

export const PRIORITY_COLORS = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};
