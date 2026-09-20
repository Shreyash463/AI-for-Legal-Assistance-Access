import React from 'react';
import { Scale, Key, ShieldAlert, CheckCircle2, Sparkles } from 'lucide-react';

export default function Header({ onOpenApiKey, hasCustomKey, activeTab, setActiveTab }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      {/* Top Banner Disclaimer */}
      <div className="bg-amber-50 border-b border-amber-200/60 px-4 py-1.5 text-xs text-amber-900 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span>
            <strong className="font-semibold">Legal Disclaimer:</strong> ClarifyLaw AI is an educational & informational tool — <span className="underline font-medium">NOT a law firm and NOT legal advice</span>. Always consult a qualified attorney for legal matters.
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">ClarifyLaw <span className="text-blue-600">AI</span></span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                <Sparkles className="w-2.5 h-2.5" /> Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block">AI for Legal Assistance & Access • Plain-English Document Intelligence</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div role="tablist" aria-label="Main Navigation" className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'analyze'}
            aria-controls="analyze-tab-panel"
            id="tab-analyze"
            onClick={() => setActiveTab('analyze')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
              activeTab === 'analyze'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Document Analyzer
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'compare'}
            aria-controls="compare-tab-panel"
            id="tab-compare"
            onClick={() => setActiveTab('compare')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
              activeTab === 'compare'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Comparison Mode
          </button>
        </div>

        {/* Right Action: API Key & Status */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenApiKey}
            aria-label={hasCustomKey ? "Gemini API key is active. Click to update or remove." : "Configure custom Gemini API key"}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
              hasCustomKey
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
            title="Configure Gemini API Key"
          >
            <Key className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{hasCustomKey ? 'API Key Active' : 'API Key'}</span>
            {hasCustomKey && <CheckCircle2 className="w-3 h-3 text-emerald-600" aria-label="Key active" />}
          </button>
        </div>
      </div>
    </header>
  );
}
