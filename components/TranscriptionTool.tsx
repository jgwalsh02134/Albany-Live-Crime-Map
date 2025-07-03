
import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface TranscriptionToolProps {
  onTranscribe: (text: string) => void;
  isLoading: boolean;
  result: string | null;
  error: string | null;
}

const TranscriptionTool: React.FC<TranscriptionToolProps> = ({ onTranscribe, isLoading, result, error }) => {
  const [text, setText] = useState('');

  const handleTranscribeClick = () => {
    onTranscribe(text);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Paste raw, abbreviated scanner text to convert it into clean, readable English.</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g., Car 214—code 3 to Judson n Lexington..."
        className="w-full h-24 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
      />
      <button
        onClick={handleTranscribeClick}
        disabled={isLoading || !text.trim()}
        className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Transcribing...
          </>
        ) : 'Transcribe Text'}
      </button>
      {error && <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-lg text-sm flex items-start"><AlertTriangle className="mr-2 mt-0.5 flex-shrink-0" size={16}/>{error}</div>}
      {result && (
        <div className="p-3 mt-4 bg-gray-50/80 rounded-lg border border-gray-200 text-sm">
            <h4 className="font-bold text-teal-700 mb-2">Transcription Result</h4>
            <p className="text-gray-700 whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </div>
  );
};

export default TranscriptionTool;
