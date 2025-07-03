
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import MapComponent from './components/MapComponent';
import Sidebar from './components/Sidebar';
import { fetchInitialCrimeData, generateRandomCrime } from './services/crimeDataService';
import { getCrimeSummary } from './services/geminiService';
import { CrimeEvent, CrimeType, AiSummary } from './types';
import { ALL_CRIME_TYPES, ALBANY_CENTER, INITIAL_ZOOM } from './constants';

const App: React.FC = () => {
  const [crimeData, setCrimeData] = useState<CrimeEvent[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<Set<CrimeType>>(new Set(ALL_CRIME_TYPES));
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<AiSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const initialData = await fetchInitialCrimeData();
        setCrimeData(initialData);
      } catch (err) {
        setError("Failed to load initial crime data.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    if (isLive) {
      intervalId = setInterval(() => {
        setCrimeData(prevData => [generateRandomCrime(), ...prevData].slice(0, 200)); // Keep max 200 events
      }, 5000); // Add a new crime every 5 seconds
    }
    return () => clearInterval(intervalId);
  }, [isLive]);

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

  const displayedCrimes = useMemo(() => {
    return crimeData.filter(crime => filteredTypes.has(crime.type));
  }, [crimeData, filteredTypes]);

  return (
    <div className="relative h-screen w-screen bg-gray-900 text-white">
      <Sidebar
        filteredTypes={filteredTypes}
        onFilterChange={handleFilterChange}
        isLive={isLive}
        onToggleLive={handleToggleLive}
        onGenerateSummary={handleGenerateSummary}
        isAiLoading={isAiLoading}
        aiSummary={aiSummary}
        error={error}
      />
      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center bg-gray-900">
          <p className="text-2xl animate-pulse">Loading Crime Data for Albany, NY...</p>
        </div>
      ) : (
        <MapComponent
          center={ALBANY_CENTER}
          zoom={INITIAL_ZOOM}
          crimes={displayedCrimes}
        />
      )}
    </div>
  );
};

export default App;
