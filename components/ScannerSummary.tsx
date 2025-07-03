
import React, { useState } from 'react';
import { ScannerIncident } from '../types';
import { AlertTriangle, Star } from 'lucide-react';

interface ScannerSummaryProps {
  incidents: ScannerIncident[] | null;
  isLoading: boolean;
  error: string | null;
  onAnalyze: (text: string) => void;
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

const ScannerSummary: React.FC<ScannerSummaryProps> = ({ incidents, isLoading, error, onAnalyze }) => {
  const [scannerText, setScannerText] = useState('');

  const handleScannerAnalysis = () => {
    onAnalyze(scannerText);
  };
  
  return (
    <>
      <textarea
        value={scannerText}
        onChange={(e) => setScannerText(e.target.value)}
        placeholder="Paste scanner text here, e.g., [3:05 PM] '...shots fired near Washington Park...'"
        className="w-full h-24 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
      />
      <button
        onClick={handleScannerAnalysis}
        disabled={isLoading || !scannerText.trim()}
        className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing...
          </>
        ) : 'Analyze Scanner Traffic'}
      </button>

      {error && <div className="p-3 mt-4 bg-red-100 border border-red-300 text-red-800 rounded-lg text-sm flex items-start"><AlertTriangle className="mr-2 mt-0.5 flex-shrink-0" size={16}/>{error}</div>}

      {incidents && incidents.length > 0 && (
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
              
              <p className="text-gray-700 mb-2">{incident.summary}</p>

              <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-200 pt-2 mt-2">
                 <span>Units: <span className="font-medium text-gray-600">{incident.units}</span></span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {incidents && incidents.length === 0 && !isLoading && (
        <p className="text-sm text-gray-500 mt-4">No significant incidents found in the traffic analysis.</p>
      )}
    </>
  );
};

export default ScannerSummary;
