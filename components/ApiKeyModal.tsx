
import React, { useState, useEffect } from 'react';
import { KeyRound, X } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (apiKey: string) => void;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave, onClose }) => {
  const [key, setKey] = useState('');

  useEffect(() => {
    // Reset input when modal opens
    if (isOpen) {
      setKey('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSaveClick = () => {
    onSave(key);
  };

  return (
    <div
      className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-md bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-6 text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>
        <div className="flex items-center mb-4">
          <div className="p-2 bg-indigo-600/20 rounded-full mr-4">
            <KeyRound size={24} className="text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold">Set Your API Key</h2>
        </div>
        <p className="text-gray-400 mb-4 text-sm">
          To use the AI Analysis feature, please provide your Google Gemini API key. Your key is saved securely in your browser's session storage and is never stored in our code.
        </p>
        <div className="mb-4">
          <label htmlFor="apiKeyInput" className="block text-sm font-medium text-gray-300 mb-2">
            Gemini API Key
          </label>
          <input
            id="apiKeyInput"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter your API key here"
            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>
        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline">
            Get your Gemini API Key here.
        </a>
        <button
          onClick={handleSaveClick}
          disabled={!key.trim()}
          className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          Save and Continue
        </button>
      </div>
    </div>
  );
};

export default ApiKeyModal;
