import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const TicketCard = ({ ticket }) => {
  return (
    <Link to={`/tickets/${ticket.id}`}>
      <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg text-gray-900">{ticket.title}</h3>
            <p className="text-sm text-gray-500">#{ticket.id}</p>
          </div>
          <StatusBadge status={ticket.status} />
        </div>

        <p className="text-gray-700 text-sm mb-3 line-clamp-2">{ticket.description}</p>

        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <div>
            <span className="text-gray-500">Category:</span>
            <p className="font-semibold text-gray-900">{ticket.category}</p>
          </div>
          <div>
            <span className="text-gray-500">Priority:</span>
            <p className={`font-semibold ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority}
            </p>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          <p>Created by: {ticket.creatorName}</p>
          {ticket.assignedTechnicianName && <p>Assigned to: {ticket.assignedTechnicianName}</p>}
        </div>

        <div className="mt-4">
          <span className="inline-flex items-center text-sm font-semibold text-blue-700">
            Open ticket →
          </span>
        </div>
      </div>
    </Link>
  );
};

const getPriorityColor = (priority) => {
  switch (priority?.toUpperCase()) {
    case 'HIGH':
      return 'text-red-600';
    case 'MEDIUM':
      return 'text-yellow-600';
    case 'LOW':
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};

export default TicketCard;
