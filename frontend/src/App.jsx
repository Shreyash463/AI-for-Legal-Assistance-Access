import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import Header from './components/Header';
import DocumentUpload from './components/DocumentUpload';
import SectionSimplifier from './components/SectionSimplifier';
import RiskRadar from './components/RiskRadar';

// Dynamic code-splitting: Lazy-load heavy sub-views and modals
const DocumentQA = lazy(() => import('./components/DocumentQA'));
const ActionChecklist = lazy(() => import('./components/ActionChecklist'));
const ComparisonView = lazy(() => import('./components/ComparisonView'));
const ApiKeyModal = lazy(() => import('./components/ApiKeyModal'));
const LegalDisclaimerModal = lazy(() => import('./components/LegalDisclaimerModal'));

import {
  Layers, ShieldAlert, MessageSquare, CheckSquare,
  RotateCcw, Trash2, AlertTriangle, ShieldCheck, Scale
} from 'lucide-react';

const ViewSkeleton = () => (
  <div className="p-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-4 animate-fade-slide">
    <div className="flex items-center gap-3">
      <div className="w-5 h-5 skeleton-shimmer rounded-full" />
      <div className="h-4 w-48 skeleton-shimmer rounded" />
    </div>
    <div className="h-3.5 w-3/4 skeleton-shimmer rounded" />
    <div className="h-48 w-full skeleton-shimmer rounded-xl mt-4" />
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('analyze'); // 'analyze' or 'compare'
  const [activeSubTab, setActiveSubTab] = useState('simplifier'); // 'simplifier', 'radar', 'qa', 'checklist'
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [readingLevel, setReadingLevel] = useState('standard');
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem('clarifylaw_gemini_key') || '');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isDisclaimerModalOpen, setIsDisclaimerModalOpen] = useState(false);

  const handleSaveApiKey = (newKey) => {
    setApiKey(newKey);
    if (newKey) {
      sessionStorage.setItem('clarifylaw_gemini_key', newKey);
    } else {
      sessionStorage.removeItem('clarifylaw_gemini_key');
    }
  };

  const handleClearSession = async () => {
    if (analysis && analysis.document_id) {
      try {
        await fetch(`/api/documents/${analysis.document_id}`, { method: 'DELETE' });
      } catch (err) {
        // ignore error during cleanup
      }
    }
    setAnalysis(null);
    setActiveSubTab('simplifier');
  };

  const getRiskScoreBadge = (score) => {
    switch (score) {
      case 'Critical Risk':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-red-700 bg-gradient-to-r from-red-50 to-rose-100 border border-red-300/80 rounded-full shadow-2xs pulse-high-risk">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
            CRITICAL RISK DETECTED
          </span>
        );
      case 'High Risk':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-red-700 bg-gradient-to-r from-red-50 to-rose-100 border border-red-300/80 rounded-full shadow-2xs">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
            HIGH RISK
          </span>
        );
      case 'Moderate Risk':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-amber-800 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-300/80 rounded-full shadow-2xs">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            MODERATE RISK
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-emerald-800 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-300/80 rounded-full shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            LOW RISK / STANDARD
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasCustomKey={!!apiKey}
        onOpenApiKey={() => setIsApiKeyModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: COMPARISON MODE */}
        {activeTab === 'compare' && (
          <Suspense fallback={<ViewSkeleton />}>
            <ComparisonView apiKey={apiKey} />
          </Suspense>
        )}

        {/* TAB 2: DOCUMENT ANALYZER */}
        {activeTab === 'analyze' && (
          <div className="space-y-6">
            {!analysis ? (
              <DocumentUpload
                onAnalyzeSuccess={(data) => {
                  setAnalysis(data);
                  setActiveSubTab('simplifier');
                }}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                readingLevel={readingLevel}
                setReadingLevel={setReadingLevel}
                apiKey={apiKey}
              />
            ) : (
              <div className="space-y-6">
                {/* Document Summary Banner */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                          {analysis.metadata.file_type}
                        </span>
                        {getRiskScoreBadge(analysis.metadata.overall_risk_score)}
                      </div>
                      <h2 className="text-xl font-extrabold text-slate-900">
                        {analysis.metadata.filename}
                      </h2>
                    </div>

                    {/* Reset / Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAnalysis(null)}
                        className="btn-press px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-200/80 shadow-2xs cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Analyze Another</span>
                      </button>
                      <button
                        onClick={handleClearSession}
                        className="btn-press px-3.5 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-transparent hover:border-red-200 cursor-pointer"
                        title="Purge document from temporary server memory"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear Session</span>
                      </button>
                    </div>
                  </div>

                  {/* Executive Summary Quote */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <strong className="text-slate-900 font-bold block mb-1">Executive Summary:</strong>
                    {analysis.metadata.executive_summary}
                  </div>

                  {/* Metric Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                      <span className="text-lg font-extrabold text-slate-900 block">
                        {analysis.metadata.section_count}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Traced Sections
                      </span>
                    </div>
                    <div className="bg-red-50/50 p-3 rounded-xl border border-red-100 text-center">
                      <span className="text-lg font-extrabold text-red-600 block">
                        {analysis.risks.filter(r => r.severity === 'HIGH').length}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-red-700">
                        High-Risk Traps
                      </span>
                    </div>
                    <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100 text-center">
                      <span className="text-lg font-extrabold text-amber-600 block">
                        {analysis.risks.length}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                        Flagged Clauses
                      </span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                      <span className="text-lg font-extrabold text-slate-900 block">
                        {analysis.metadata.word_count}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Total Words
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sub-Navigation Tabs */}
                <div role="tablist" aria-label="Analysis Feature Views" className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-2xs overflow-x-auto gap-1">
                  <button
                    type="button"
                    role="tab"
                    id="subtab-simplifier"
                    aria-selected={activeSubTab === 'simplifier'}
                    onClick={() => setActiveSubTab('simplifier')}
                    className={`btn-press px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none cursor-pointer ${
                      activeSubTab === 'simplifier'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Layers className="w-4 h-4" aria-hidden="true" />
                    <span>1. Simplified Clauses & Traceability</span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    id="subtab-radar"
                    aria-selected={activeSubTab === 'radar'}
                    onClick={() => setActiveSubTab('radar')}
                    className={`btn-press px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none cursor-pointer ${
                      activeSubTab === 'radar'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" aria-hidden="true" />
                    <span>2. Risk & Clause Radar ({analysis.risks.length})</span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    id="subtab-qa"
                    aria-selected={activeSubTab === 'qa'}
                    onClick={() => setActiveSubTab('qa')}
                    className={`btn-press px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none cursor-pointer ${
                      activeSubTab === 'qa'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" aria-hidden="true" />
                    <span>3. Grounded Q&A</span>
                  </button>

                  <button
                    type="button"
                    role="tab"
                    id="subtab-checklist"
                    aria-selected={activeSubTab === 'checklist'}
                    onClick={() => setActiveSubTab('checklist')}
                    className={`btn-press px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none cursor-pointer ${
                      activeSubTab === 'checklist'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <CheckSquare className="w-4 h-4" aria-hidden="true" />
                    <span>4. Action Checklist & Export</span>
                  </button>
                </div>

                {/* Sub-Tab Panels with Fade/Slide Transitions */}
                <div key={activeSubTab} className="animate-fade-slide">
                  {activeSubTab === 'simplifier' && (
                    <SectionSimplifier
                      sections={analysis.sections}
                      rawText={analysis.raw_text}
                    />
                  )}

                  {activeSubTab === 'radar' && (
                    <RiskRadar
                      risks={analysis.risks}
                      onJumpToSection={() => {
                        setActiveSubTab('simplifier');
                      }}
                    />
                  )}

                  {activeSubTab === 'qa' && (
                    <Suspense fallback={<ViewSkeleton />}>
                      <DocumentQA
                        documentText={analysis.raw_text}
                        documentId={analysis.document_id}
                        apiKey={apiKey}
                      />
                    </Suspense>
                  )}

                  {activeSubTab === 'checklist' && (
                    <Suspense fallback={<ViewSkeleton />}>
                      <ActionChecklist analysis={analysis} />
                    </Suspense>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Persistent Footer Disclaimer */}
      <footer className="bg-white border-t border-slate-200 mt-auto text-xs text-slate-500 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-blue-600" />
            <span>
              <strong>ClarifyLaw AI</strong> • Hackathon Submission for PromptWars Exclusive Edition
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsDisclaimerModalOpen(true)}
              className="text-slate-600 hover:text-blue-600 underline font-medium"
            >
              Legal & Privacy Notice
            </button>
            <span>•</span>
            <span>Problem Statement: AI for Legal Assistance & Access</span>
          </div>
        </div>
      </footer>

      {/* Modals with Suspense */}
      <Suspense fallback={null}>
        {isApiKeyModalOpen && (
          <ApiKeyModal
            isOpen={isApiKeyModalOpen}
            onClose={() => setIsApiKeyModalOpen(false)}
            apiKey={apiKey}
            onSaveApiKey={handleSaveApiKey}
          />
        )}

        {isDisclaimerModalOpen && (
          <LegalDisclaimerModal
            isOpen={isDisclaimerModalOpen}
            onClose={() => setIsDisclaimerModalOpen(false)}
          />
        )}
      </Suspense>
    </div>
  );
}
