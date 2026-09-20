import React, { useState } from 'react';
import { Key, ShieldCheck, X, ExternalLink } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose, apiKey, onSaveApiKey }) {
  const [inputVal, setInputVal] = useState(apiKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveApiKey(inputVal.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setInputVal('');
    onSaveApiKey('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-api-title"
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
      >
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-semibold" id="modal-api-title">
            <Key className="w-4 h-4 text-blue-600" />
            <span>Gemini API Configuration</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Gemini API Settings dialog"
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono placeholder:text-slate-400"
            />
          </div>

          <div className="text-xs text-slate-600 space-y-2 bg-blue-50/70 p-3.5 rounded-xl border border-blue-100">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Privacy Guarantee:</strong> Your key is stored solely in your browser's temporary session storage and never saved to any external database.
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Note: If a server-side <code className="bg-white px-1 py-0.5 rounded border">GEMINI_API_KEY</code> is configured in <code className="bg-white px-1 py-0.5 rounded border">.env</code>, you can leave this blank.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              Get free Gemini API Key <ExternalLink className="w-3 h-3" />
            </a>

            <div className="flex items-center gap-2">
              {inputVal && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-2 text-xs text-slate-600 hover:text-red-600 font-medium transition"
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 shadow-sm transition"
              >
                {savedSuccess ? 'Saved!' : 'Save Key'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
