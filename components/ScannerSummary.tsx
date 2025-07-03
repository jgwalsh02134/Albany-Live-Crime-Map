import React from 'react';
import { ScannerIncident } from '../types';
import { AlertTriangle, Star } from 'lucide-react';

interface ScannerSummaryProps {
  incidents: ScannerIncident[] | null;
  isLoading: boolean;
  error: string | null;
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          size={14}
          className={index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
        />
      ))}
    </div>
  );
};

const ScannerSummary: React.FC<ScannerSummaryProps> = ({ incidents, isLoading, error }) => {
  if (isLoading) {
    return null; // The loading spinner is handled in the parent button
  }

  if (error) {
    return <div className="p-3 mt-4 bg-red-100 border border-red-300 text-red-800 rounded-lg text-sm flex items-start"><AlertTriangle className="mr-2 mt-0.5 flex-shrink-0" size={16}/>{error}</div>
  }

  if (!incidents) {
    return null;
  }
  
  if (incidents.length === 0) {
      return <p className="text-sm text-gray-500 mt-4">No significant incidents found in the traffic analysis.</p>
  }

  return (
    <div className="space-y-3 pt-4">
      {incidents.map((incident, index) => (
        <div key={index} className="p-3 bg-gray-50/80 rounded-lg border border-gray-200 text-sm">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-bold text-cyan-700">{incident.type}</h4>
              <p className="text-xs text-gray-500">{incident.location}</p>
            </div>
            <div className="text-right">
              <StarRating rating={incident.confidence} />
              <p className="text-xs text-gray-400 mt-0.5">{incident.time}</p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-2">{incident.details}</p>

          <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-200 pt-2 mt-2">
             <span>Units: <span className="font-medium text-gray-600">{incident.units}</span></span>
             <span>Status: <span className="font-medium text-gray-600">{incident.status}</span></span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScannerSummary;
