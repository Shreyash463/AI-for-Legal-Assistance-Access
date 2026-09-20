import React from 'react';
import { Scale, Key, ShieldCheck, CheckCircle2, Sparkles, Settings } from 'lucide-react';

export default function Header({ onOpenApiKey, hasCustomKey, activeTab, setActiveTab }) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      {/* Top Professional Compliance Notice Bar */}
      <div className="bg-slate-900 text-slate-300 border-b border-slate-800 px-4 py-1.5 text-[11px]">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium flex-shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <span className="font-semibold text-slate-200 tracking-wide uppercase text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
              Compliance Notice
            </span>
          </div>
          <p className="text-slate-300 text-xs truncate">
            ClarifyLaw AI is an educational & informational document intelligence tool — <span className="text-slate-100 font-medium">not a law firm and not legal advice</span>. Always consult a qualified attorney for formal legal representation.
          </p>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 transition-transform hover:scale-105">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                ClarifyLaw <span className="text-blue-600">AI</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 px-2 py-0.5 rounded-full shadow-xs">
                <Sparkles className="w-2.5 h-2.5" /> Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block">AI for Legal Assistance & Access • Plain-English Document Intelligence</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div role="tablist" aria-label="Main Navigation" className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 shadow-xs">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'analyze'}
            aria-controls="analyze-tab-panel"
            id="tab-analyze"
            onClick={() => setActiveTab('analyze')}
            className={`px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all btn-press focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
              activeTab === 'analyze'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
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
            className={`px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all btn-press focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
              activeTab === 'compare'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200/50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            Comparison Mode
          </button>
        </div>

        {/* Right Action: Settings / API Key with Tooltip */}
        <div className="flex items-center gap-2">
          <div className="relative group">
            <button
              type="button"
              onClick={onOpenApiKey}
              aria-label={hasCustomKey ? "Settings: Custom Gemini API key is configured. Click to view or change." : "Settings: Configure custom Gemini API key"}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border transition-all btn-press focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none flex items-center gap-1.5 shadow-xs ${
                hasCustomKey
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100/80'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title="Settings: Configure Gemini API Key"
            >
              <Settings className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45 text-slate-600" aria-hidden="true" />
              {hasCustomKey ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="hidden sm:inline">API Key Active</span>
                </span>
              ) : (
                <span className="hidden sm:inline text-xs font-medium text-slate-600">Settings</span>
              )}
            </button>
            {/* Tooltip */}
            <div className="absolute right-0 top-full mt-2 hidden group-hover:block z-50 w-56 p-2.5 bg-slate-900 text-white text-[11px] rounded-xl shadow-xl pointer-events-none border border-slate-700 leading-tight">
              <p className="font-semibold text-slate-200 mb-0.5">Gemini API Settings</p>
              <p className="text-slate-400">
                {hasCustomKey
                  ? "Custom key active. Click to update or clear your key."
                  : "Optional: Provide your own Gemini API key for dedicated quota."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
