import React, { useState, useRef } from 'react';
import { Layers, FileText, CheckCircle, ExternalLink, ArrowRight, Eye } from 'lucide-react';

export default function SectionSimplifier({ sections, rawText }) {
  const [activeSectionId, setActiveSectionId] = useState(sections && sections[0] ? sections[0].id : null);
  const originalPaneRef = useRef(null);

  const handleSelectSection = (secId) => {
    setActiveSectionId(secId);
    // Scroll original text pane to the corresponding section if in split view
    const elem = document.getElementById(`orig-${secId}`);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Term & Renewal':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Payment':
      case 'Payment & Financial':
      case 'Payment & Deposit':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Liability':
      case 'Liability & Risk':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Termination':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Dispute Resolution':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Plain-English Section Simplification & Traceability
          </h3>
          <p className="text-xs text-slate-500">
            Click any simplified clause on the left to highlight and trace its exact original contract wording on the right.
          </p>
        </div>
        <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full self-start sm:self-auto">
          {sections.length} Sections Indexed & Traced
        </span>
      </div>

      {/* Split Interactive View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Simplified Plain-English Cards */}
        <div className="lg:col-span-7 space-y-3">
          {sections.map((sec) => {
            const isSelected = activeSectionId === sec.id;
            return (
              <div
                key={sec.id}
                onClick={() => handleSelectSection(sec.id)}
                className={`p-4 rounded-xl border transition cursor-pointer relative ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/40 shadow-sm ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded">
                      {sec.id}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{sec.title}</h4>
                  </div>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(sec.category)}`}>
                    {sec.category}
                  </span>
                </div>

                <div className="text-xs text-slate-800 leading-relaxed font-medium mt-2 bg-white/80 p-3 rounded-lg border border-slate-100">
                  {sec.plain_english}
                </div>

                {sec.key_takeaways && sec.key_takeaways.length > 0 && (
                  <div className="mt-2.5 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Key Takeaways:</span>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {sec.key_takeaways.map((takeaway, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-blue-600 font-semibold">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Trace to original clause
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Original Document Traceability Viewer */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-slate-900 text-slate-200 rounded-2xl shadow-md border border-slate-800 overflow-hidden flex flex-col h-[650px]">
            <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold tracking-wide uppercase text-slate-300">
                  Original Document Text (Source of Truth)
                </span>
              </div>
              <span className="text-[11px] font-mono bg-slate-800 text-blue-300 px-2 py-0.5 rounded border border-slate-700">
                Active: {activeSectionId}
              </span>
            </div>

            <div
              ref={originalPaneRef}
              className="p-4 overflow-y-auto space-y-4 text-xs font-mono leading-relaxed text-slate-300 flex-1"
            >
              {sections.map((sec) => {
                const isSelected = activeSectionId === sec.id;
                return (
                  <div
                    key={`orig-${sec.id}`}
                    id={`orig-${sec.id}`}
                    onClick={() => setActiveSectionId(sec.id)}
                    className={`p-3 rounded-xl transition cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-950/70 border-blue-500 ring-1 ring-blue-500/50 text-white'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-800 text-[11px] text-blue-400 font-semibold">
                      <span>[{sec.id}] {sec.title}</span>
                      {isSelected && (
                        <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded font-bold uppercase">
                          Trace Matched
                        </span>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap">{sec.original_text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
