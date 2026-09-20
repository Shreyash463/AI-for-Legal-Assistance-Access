import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DocumentUpload from './components/DocumentUpload';
import SectionSimplifier from './components/SectionSimplifier';
import RiskRadar from './components/RiskRadar';
import DocumentQA from './components/DocumentQA';
import ActionChecklist from './components/ActionChecklist';
import ComparisonView from './components/ComparisonView';
import ApiKeyModal from './components/ApiKeyModal';
import LegalDisclaimerModal from './components/LegalDisclaimerModal';
import {
  Layers, ShieldAlert, MessageSquare, CheckSquare,
  FileText, RotateCcw, Trash2, AlertTriangle, ShieldCheck, Scale, Sparkles
} from 'lucide-react';

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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-red-700 bg-red-100 border border-red-300 rounded-full">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            CRITICAL RISK DETECTED
          </span>
        );
      case 'High Risk':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-full">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            HIGH RISK
          </span>
        );
      case 'Moderate Risk':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-300 rounded-full">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            MODERATE RISK
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
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
          <ComparisonView apiKey={apiKey} />
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
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Analyze Another</span>
                      </button>
                      <button
                        onClick={handleClearSession}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-transparent hover:border-red-200"
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
                <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-sm overflow-x-auto gap-1">
                  <button
                    onClick={() => setActiveSubTab('simplifier')}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition ${
                      activeSubTab === 'simplifier'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>1. Simplified Clauses & Traceability</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('radar')}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition ${
                      activeSubTab === 'radar'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>2. Risk & Clause Radar ({analysis.risks.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('qa')}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition ${
                      activeSubTab === 'qa'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>3. Grounded Q&A</span>
                  </button>

                  <button
                    onClick={() => setActiveSubTab('checklist')}
                    className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition ${
                      activeSubTab === 'checklist'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>4. Action Checklist & Export</span>
                  </button>
                </div>

                {/* Sub-Tab Panels */}
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
                  <DocumentQA
                    documentText={analysis.raw_text}
                    documentId={analysis.document_id}
                    apiKey={apiKey}
                  />
                )}

                {activeSubTab === 'checklist' && (
                  <ActionChecklist analysis={analysis} />
                )}
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

      {/* Modals */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />

      <LegalDisclaimerModal
        isOpen={isDisclaimerModalOpen}
        onClose={() => setIsDisclaimerModalOpen(false)}
      />
    </div>
  );
}
