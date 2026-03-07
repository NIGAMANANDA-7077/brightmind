import React from 'react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

const TicketCard = ({ ticket }) => {
    const statusColors = {
        'Open': 'bg-blue-50 text-blue-600',
        'Pending': 'bg-orange-50 text-orange-600',
        'Closed': 'bg-green-50 text-green-600'
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 hover:border-[#8b5cf6]/30 transition-all shadow-sm">
            <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-gray-400">ID: {ticket.id}</span>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${statusColors[ticket.status]}`}>
                    {ticket.status}
                </span>
            </div>

            <h3 className="font-bold text-gray-900 mb-2">{ticket.subject}</h3>
            <p className="text-sm text-gray-500 line-clamp-2 mb-4">{ticket.description}</p>

            <div className="flex items-center gap-2 text-xs text-gray-400 border-t border-gray-50 pt-3">
                <Clock size={12} />
                <span>Last updated {ticket.lastUpdated}</span>
            </div>
        </div>
    );
};

export default TicketCard;
