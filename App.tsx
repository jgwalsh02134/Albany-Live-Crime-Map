
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import MapComponent from './components/MapComponent';
import Sidebar from './components/Sidebar';
import { fetchLiveCrimeData } from './services/crimeDataService';
import { getCrimeSummary, getScannerSummary, getRssSummary } from './services/geminiService';
import { CrimeEvent, CrimeType, AiSummary, ScannerIncident, RssIncident } from './types';
import { ALL_CRIME_TYPES, ALBANY_CENTER, INITIAL_ZOOM } from './constants';
import { AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [crimeData, setCrimeData] = useState<CrimeEvent[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<Set<CrimeType>>(new Set(ALL_CRIME_TYPES));
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<AiSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // State for Scanner Summary
  const [scannerSummary, setScannerSummary] = useState<ScannerIncident[] | null>(null);
  const [isScannerLoading, setIsScannerLoading] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);

  // State for RSS Summary
  const [rssSummary, setRssSummary] = useState<RssIncident[] | null>(null);
  const [isRssLoading, setIsRssLoading] = useState(false);
  const [rssError, setRssError] = useState<string | null>(null);


  const loadCrimeData = useCallback(async () => {
      // Don't set loading to true on subsequent polls
      if (crimeData.length === 0) {
        setIsLoading(true);
      }
      setError(null);
      try {
        const liveData = await fetchLiveCrimeData();
        setCrimeData(liveData);
      } catch (err) {
        setError("Failed to load live crime data from the city's API. The service may be temporarily unavailable.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
  }, [crimeData.length]);

  useEffect(() => {
    loadCrimeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on initial mount

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    if (isLive) {
      // Poll for new data every 60 seconds
      intervalId = setInterval(loadCrimeData, 60000); 
    }
    return () => clearInterval(intervalId);
  }, [isLive, loadCrimeData]);

  const handleFilterChange = (type: CrimeType) => {
    setFilteredTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };
  
  const handleToggleLive = () => {
    setIsLive(prev => !prev);
  };

  const handleGenerateSummary = useCallback(async () => {
    setIsAiLoading(true);
    setError(null);
    setAiSummary(null);
    try {
      const summary = await getCrimeSummary(crimeData.slice(0, 50)); // Summarize latest 50
      setAiSummary(summary);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred with the AI summary.";
      setError(`Failed to generate summary: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  }, [crimeData]);

  const handleGenerateScannerSummary = useCallback(async () => {
    setIsScannerLoading(true);
    setScannerError(null);
    setScannerSummary(null);
    try {
        const summary = await getScannerSummary();
        setScannerSummary(summary);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred with the scanner analysis.";
        setScannerError(`Failed to analyze scanner traffic: ${errorMessage}`);
        console.error(err);
    } finally {
        setIsScannerLoading(false);
    }
  }, []);

  const handleGenerateRssSummary = useCallback(async () => {
    setIsRssLoading(true);
    setRssError(null);
    setRssSummary(null);
    try {
      const summary = await getRssSummary();
      setRssSummary(summary);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred with the RSS analysis.";
      setRssError(`Failed to analyze RSS feeds: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsRssLoading(false);
    }
  }, []);

  const displayedCrimes = useMemo(() => {
    return crimeData.filter(crime => filteredTypes.has(crime.type));
  }, [crimeData, filteredTypes]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-gray-50">
          <p className="text-2xl animate-pulse text-gray-600">Loading Live Crime Data from Albany Open Data Portal...</p>
        </div>
      );
    }

    if (error && crimeData.length === 0) {
       return (
        <div className="flex h-full w-full items-center justify-center bg-gray-50 p-8">
            <div className="p-6 bg-red-100 border border-red-300 text-red-800 rounded-lg text-center shadow-lg">
                <AlertTriangle className="mx-auto mb-4" size={48} />
                <h2 className="text-2xl font-bold mb-2">Data Fetching Error</h2>
                <p className="text-red-700">{error}</p>
                <p className="mt-4 text-sm">Please try refreshing the page in a few moments.</p>
            </div>
        </div>
      );
    }
    
    return (
       <MapComponent
          center={ALBANY_CENTER}
          zoom={INITIAL_ZOOM}
          crimes={displayedCrimes}
        />
    )
  }

  return (
    <div className="relative h-screen w-screen bg-gray-50 text-gray-900">
      <Sidebar
        filteredTypes={filteredTypes}
        onFilterChange={handleFilterChange}
        isLive={isLive}
        onToggleLive={handleToggleLive}
        onGenerateSummary={handleGenerateSummary}
        isAiLoading={isAiLoading}
        aiSummary={aiSummary}
        error={error}
        onGenerateScannerSummary={handleGenerateScannerSummary}
        isScannerLoading={isScannerLoading}
        scannerSummary={scannerSummary}
        scannerError={scannerError}
        onGenerateRssSummary={handleGenerateRssSummary}
        isRssLoading={isRssLoading}
        rssSummary={rssSummary}
        rssError={rssError}
      />
      {renderContent()}
    </div>
  );
};

export default App;
