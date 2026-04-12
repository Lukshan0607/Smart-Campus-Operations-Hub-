import React from 'react';

const StatusBadge = ({ status }) => {
  const statusStyles = {
    OPEN: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    RESOLVED: 'bg-green-100 text-green-800',
    CLOSED: 'bg-gray-100 text-gray-800',
    REJECTED: 'bg-red-100 text-red-800',
  };

  const statusLabels = {
    OPEN: 'Open',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
    REJECTED: 'Rejected',
  };

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}
    >
      {statusLabels[status] || status}
    </span>
  );
};

export default StatusBadge;
