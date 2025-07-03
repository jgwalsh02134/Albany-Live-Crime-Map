import React, { useState } from 'react';
import { CrimeType, AiSummary } from '../types';
import { ALL_CRIME_TYPES, CRIME_TYPE_DETAILS } from '../constants';
import { ChevronLeft, ChevronRight, Activity, Filter, Info, BrainCircuit, AlertTriangle, CheckCircle, BarChart, Database } from 'lucide-react';

interface SidebarProps {
  filteredTypes: Set<CrimeType>;
  onFilterChange: (type: CrimeType) => void;
  isLive: boolean;
  onToggleLive: () => void;
  onGenerateSummary: () => void;
  isAiLoading: boolean;
  aiSummary: AiSummary | null;
  error: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  filteredTypes,
  onFilterChange,
  isLive,
  onToggleLive,
  onGenerateSummary,
  isAiLoading,
  aiSummary,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-1/2 -translate-y-1/2 z-[1000] p-2 bg-gray-800 text-white rounded-r-lg transition-all duration-300 ease-in-out"
        style={{ left: isOpen ? '384px' : '0px' }}
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
      </button>
      <div
        className={`absolute top-0 left-0 h-full z-[999] bg-gray-900/80 backdrop-blur-sm text-white transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: '384px' }}
      >
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-3xl font-bold flex items-center">
            <Activity className="mr-3 text-red-500" />
            Albany Crime Map
          </h1>
          <p className="text-sm text-gray-400">Live incident monitoring</p>
        </div>

        <div className="flex-grow p-4 overflow-y-auto space-y-6">
          {/* Controls */}
           <div className="p-4 bg-gray-800 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="liveToggle" className="font-bold text-lg flex items-center">
                 <Activity className="mr-2" size={20} /> Live Feed
              </label>
              <button
                onClick={onToggleLive}
                id="liveToggle"
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                  isLive ? 'bg-red-600' : 'bg-gray-600'
                }`}
              >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                    isLive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div>
            <h2 className="text-xl font-semibold mb-3 flex items-center"><Filter className="mr-2" size={20} /> Crime Filters</h2>
            <div className="grid grid-cols-2 gap-2">
              {ALL_CRIME_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => onFilterChange(type)}
                  className={`p-2 rounded-md text-sm transition-all duration-200 flex items-center justify-start space-x-2 ${
                    filteredTypes.has(type) ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div style={{backgroundColor: CRIME_TYPE_DETAILS[type].color}} className="w-3 h-3 rounded-full flex-shrink-0"></div>
                  <span>{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Summary */}
          <div>
            <h2 className="text-xl font-semibold mb-3 flex items-center"><BrainCircuit className="mr-2" size={20} /> AI Analysis</h2>
            <div className="p-4 bg-gray-800 rounded-lg space-y-4">
              <p className="text-sm text-gray-400">Get an AI-generated summary of the latest 50 incidents.</p>
              <button
                onClick={onGenerateSummary}
                disabled={isAiLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                {isAiLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </>
                ) : 'Generate Summary'}
              </button>
              {error && <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-sm flex items-start"><AlertTriangle className="mr-2 mt-0.5 flex-shrink-0" size={16}/>{error}</div>}
              {aiSummary && (
                <div className="space-y-4 pt-2">
                   <div>
                    <h4 className="font-bold flex items-center text-indigo-300"><Info className="mr-2" size={16} /> Summary</h4>
                    <p className="text-sm text-gray-300 mt-1">{aiSummary.summary}</p>
                   </div>
                   <div>
                    <h4 className="font-bold flex items-center text-indigo-300"><BarChart className="mr-2" size={16} /> Key Trends</h4>
                    <ul className="list-disc list-inside text-sm text-gray-300 mt-1 space-y-1">
                      {aiSummary.trends.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                   </div>
                   <div>
                    <h4 className="font-bold flex items-center text-indigo-300"><CheckCircle className="mr-2" size={16} /> Safety Tips</h4>
                    <ul className="list-disc list-inside text-sm text-gray-300 mt-1 space-y-1">
                      {aiSummary.safetyTips.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* Data Sources */}
          <div>
            <h2 className="text-xl font-semibold mb-3 flex items-center"><Database className="mr-2" size={20} /> Data Sources</h2>
            <div className="p-4 bg-gray-800 rounded-lg space-y-3 text-sm">
                
                <div>
                    <h3 className="font-bold text-gray-300">Tier 1 – Official &amp; Government</h3>
                    <p className="text-xs text-gray-500 mb-2">(High reliability, validated data)</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-400">
                        <li><a href="https://data.albanyny.gov/browse" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">City of Albany Open Data</a></li>
                        <li><a href="https://local.nixle.com/city/ny/albany/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Nixle Police Alerts</a></li>
                        <li><a href="https://www.criminaljustice.ny.gov/crimnet/ojsa/stats.htm" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">NYS DCJS Crime Statistics</a></li>
                        <li><a href="https://data.ny.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">NYS Open Data</a></li>
                        <li><a href="https://cde.ucr.cjis.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">FBI Crime Data Explorer (CDE)</a></li>
                        <li><a href="https://hub.arcgis.com/maps/albanyny-GIS::neighborhood-associations-public-web-map/about" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Albany County GIS Hub</a></li>
                        <li><a href="https://www.albanyny.gov/348/Albany-Police" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Albany Police Department</a></li>
                        <li><a href="https://x.com/albanypolice" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Albany PD (X/Twitter)</a></li>
                         <li><a href="https://www.albanyny.gov/rss.aspx" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">City of Albany RSS Feeds</a></li>
                    </ul>
                </div>

                <div className="pt-2">
                    <h3 className="font-bold text-gray-300">Tier 2 – News Media &amp; Scanners</h3>
                    <p className="text-xs text-gray-500 mb-2">(Verified reporting and live feeds)</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-400">
                        <li><a href="https://www.timesunion.com/news/local/crime/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Times Union – Crime</a></li>
                        <li><a href="https://wnyt.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">NewsChannel 13 (WNYT)</a></li>
                        <li><a href="https://www.cbs6albany.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">WRGB CBS 6</a></li>
                        <li><a href="https://www.news10.com/news/crime/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">WTEN ABC 10 – Crime</a></li>
                        <li><a href="https://spectrumlocalnews.com/nys/capital-region" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Spectrum News 1</a></li>
                        <li><a href="https://www.broadcastify.com/listen/feed/336" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Broadcastify Scanner (Albany)</a></li>
                        <li><a href="https://openmhz.com/system/albanycony" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">OpenMHz Radio Archives</a></li>
                    </ul>
                </div>

                <div className="pt-2">
                    <h3 className="font-bold text-gray-300">Tier 3 – Community &amp; Crowdsourced</h3>
                    <p className="text-xs text-gray-500 mb-2">(User-generated, may need validation)</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-400">
                        <li><a href="https://spotcrime.com/NY/Albany" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">SpotCrime Albany</a></li>
                        <li><a href="https://www.crimemapping.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">CrimeMapping.com</a></li>
                        <li><a href="https://communitycrimemap.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">LexisNexis Community Crime Map</a></li>
                        <li><a href="https://www.reddit.com/r/Albany/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">r/Albany Subreddit</a></li>
                        <li><a href="https://nextdoor.com/city/albany--ny" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Nextdoor Albany</a></li>
                        <li><a href="https://citizen.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Citizen App</a></li>
                    </ul>
                </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Sidebar;